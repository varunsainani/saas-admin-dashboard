const { localeFromRequest, t } = require("../i18n");

// Resolves the request locale (X-Locale header, then Accept-Language) and exposes
// a bound translator at req.t so handlers and the error middleware can localize.
module.exports = function locale(req, res, next) {
  req.locale = localeFromRequest(req);
  req.t = (key, vars) => t(req.locale, key, vars);
  next();
};
