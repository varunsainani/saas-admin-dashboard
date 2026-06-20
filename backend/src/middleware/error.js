const { ZodError } = require("zod");
const { t, zodIssueMessage, DEFAULT_LOCALE } = require("../i18n");

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  const locale = req.locale || DEFAULT_LOCALE;

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: t(locale, "errors.common.invalidInput"),
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: zodIssueMessage(i, locale),
      })),
    });
  }
  if (err && err.status) {
    return res.status(err.status).json({
      error: t(locale, err.publicMessage || "errors.common.requestFailed"),
    });
  }
  console.error(err);
  return res.status(500).json({ error: t(locale, "errors.common.internalServerError") });
};
