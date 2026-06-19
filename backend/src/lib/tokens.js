const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TTL_DAYS = 30;

// Short-lived access token. Carries the identity needed for auth + RBAC so the
// common path does not hit the database.
function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, org: user.organizationId, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// Opaque refresh token: the raw value goes to the client, only its hash is
// stored, so a database leak cannot be used to mint access tokens.
function generateRefreshToken() {
  const raw = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  return { raw, hash: hashToken(raw), expiresAt };
}

// Email verification token (signed, single purpose, 1 day).
function signVerifyToken(userId) {
  return jwt.sign({ sub: userId, t: "verify" }, ACCESS_SECRET, { expiresIn: "1d" });
}

function verifyVerifyToken(token) {
  const payload = jwt.verify(token, ACCESS_SECRET);
  if (payload.t !== "verify") throw new Error("Wrong token type");
  return payload;
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  signVerifyToken,
  verifyVerifyToken,
};
