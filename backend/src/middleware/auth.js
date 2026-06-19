const { verifyAccessToken } = require("../lib/tokens");

// Requires a valid access token. Identity (userId, orgId, role) is read straight
// from the token so most requests avoid a database round-trip.
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, orgId: payload.org, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
