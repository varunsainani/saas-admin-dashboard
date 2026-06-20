const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const HttpError = require("../lib/http-error");
const asyncHandler = require("../lib/async-handler");
const { logAudit } = require("../lib/audit");
const { publicUser } = require("../lib/serialize");
const { randomColor } = require("../lib/constants");
const { sendVerificationEmail } = require("../lib/email");
const {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  signVerifyToken,
  verifyVerifyToken,
} = require("../lib/tokens");

function slugify(s) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "team"
  );
}

async function uniqueSlug(base) {
  const root = slugify(base);
  let slug = root;
  let i = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${root}-${i++}`;
  }
  return slug;
}

async function issueSession(user) {
  const accessToken = signAccessToken(user);
  const { raw, hash, expiresAt } = generateRefreshToken();
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hash, expiresAt },
  });
  return { accessToken, refreshToken: raw };
}

const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(2, "Workspace name is too short"),
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, organizationName } = registerSchema.parse(req.body);
  const normalized = email.toLowerCase();

  if (await prisma.user.findUnique({ where: { email: normalized } })) {
    throw new HttpError(409, "An account with that email already exists");
  }

  const org = await prisma.organization.create({
    data: { name: organizationName, slug: await uniqueSlug(organizationName) },
  });

  const user = await prisma.user.create({
    data: {
      organizationId: org.id,
      name,
      email: normalized,
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: false,
      avatarColor: randomColor(),
      lastActiveAt: new Date(),
    },
  });

  // First org always starts on Free if the plans are seeded.
  const free = await prisma.plan.findUnique({ where: { name: "Free" } });
  if (free) {
    await prisma.subscription.create({
      data: {
        organizationId: org.id,
        planId: free.id,
        status: "TRIALING",
        seatsUsed: 1,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const verifyToken = signVerifyToken(user.id);
  await sendVerificationEmail({ to: user.email, name: user.name, token: verifyToken });

  await logAudit({
    orgId: org.id,
    actorId: user.id,
    action: "auth.register",
    target: org.name,
    ip: req.ip,
  });

  const session = await issueSession(user);
  // verifyToken is returned so the demo can complete verification without inbox
  // access (the Resend test domain only delivers to the account owner).
  res.status(201).json({ user: publicUser(user), ...session, verifyToken });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user || user.status === "SUSPENDED" || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, "Invalid email or password");
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  await logAudit({ orgId: user.organizationId, actorId: user.id, action: "auth.login", ip: req.ip });

  const session = await issueSession(user);
  res.json({ user: publicUser(user), ...session });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken;
  if (!token) throw new HttpError(400, "Refresh token is required");

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new HttpError(401, "Invalid or expired refresh token");
  }

  // Rotate: the used refresh token is revoked and replaced.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const session = await issueSession(stored.user);
  res.json(session);
});

const logout = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken;
  if (token) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(token) },
      data: { revoked: true },
    });
  }
  res.json({ ok: true });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (!user) throw new HttpError(404, "User not found");
  res.json({ user: publicUser(user) });
});

const verifyEmailSchema = z.object({ token: z.string().min(1) });

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = verifyEmailSchema.parse(req.body);
  let payload;
  try {
    payload = verifyVerifyToken(token);
  } catch {
    throw new HttpError(400, "Invalid or expired verification token");
  }
  await prisma.user.update({ where: { id: payload.sub }, data: { emailVerified: true } });
  res.json({ ok: true });
});

// Re-send the verification email for the signed-in user.
const resendVerification = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (!user) throw new HttpError(404, "User not found");
  if (user.emailVerified) return res.json({ ok: true, alreadyVerified: true });
  const token = signVerifyToken(user.id);
  const result = await sendVerificationEmail({ to: user.email, name: user.name, token });
  // token returned for demo convenience (test domain restricts real delivery).
  res.json({ ok: true, sent: result.sent, token });
});

module.exports = { register, login, refresh, logout, me, verifyEmail, resendVerification };
