const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const HttpError = require("../lib/http-error");
const asyncHandler = require("../lib/async-handler");
const { logAudit } = require("../lib/audit");
const { publicUser } = require("../lib/serialize");
const { randomColor } = require("../lib/constants");

const ROLES = ["ADMIN", "MANAGER", "USER"];

const list = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { organizationId: req.auth.orgId },
    orderBy: { createdAt: "asc" },
  });
  res.json({ users: users.map(publicUser) });
});

const inviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(ROLES).default("USER"),
  title: z.string().optional(),
});

const create = asyncHandler(async (req, res) => {
  const { name, email, role, title } = inviteSchema.parse(req.body);
  if (await prisma.user.findUnique({ where: { email: email.toLowerCase() } })) {
    throw new HttpError(409, "A user with that email already exists");
  }
  // Invited users get an unusable random password until they accept.
  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
  const user = await prisma.user.create({
    data: {
      organizationId: req.auth.orgId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      status: "INVITED",
      emailVerified: false,
      title: title ?? null,
      avatarColor: randomColor(),
    },
  });
  await logAudit({
    orgId: req.auth.orgId,
    actorId: req.auth.userId,
    action: "user.invited",
    target: user.name,
    metadata: { role },
    ip: req.ip,
  });
  res.status(201).json({ user: publicUser(user) });
});

const updateSchema = z
  .object({
    role: z.enum(ROLES).optional(),
    status: z.enum(["ACTIVE", "INVITED", "SUSPENDED"]).optional(),
    title: z.string().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "Nothing to update" });

const update = asyncHandler(async (req, res) => {
  const target = await prisma.user.findFirst({
    where: { id: req.params.id, organizationId: req.auth.orgId },
  });
  if (!target) throw new HttpError(404, "User not found");

  const data = updateSchema.parse(req.body);
  const user = await prisma.user.update({ where: { id: target.id }, data });
  await logAudit({
    orgId: req.auth.orgId,
    actorId: req.auth.userId,
    action: "user.updated",
    target: user.name,
    metadata: data,
    ip: req.ip,
  });
  res.json({ user: publicUser(user) });
});

const remove = asyncHandler(async (req, res) => {
  if (req.params.id === req.auth.userId) {
    throw new HttpError(400, "You cannot remove your own account");
  }
  const target = await prisma.user.findFirst({
    where: { id: req.params.id, organizationId: req.auth.orgId },
  });
  if (!target) throw new HttpError(404, "User not found");

  await prisma.user.delete({ where: { id: target.id } });
  await logAudit({
    orgId: req.auth.orgId,
    actorId: req.auth.userId,
    action: "user.removed",
    target: target.name,
    ip: req.ip,
  });
  res.json({ ok: true });
});

module.exports = { list, create, update, remove };
