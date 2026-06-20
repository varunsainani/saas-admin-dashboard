// Restricts a route to the given roles. Use after the auth middleware.
module.exports = function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth) return res.status(401).json({ error: req.t("errors.auth.authenticationRequired") });
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: req.t("errors.rbac.forbidden") });
    }
    next();
  };
};
