const catalogs = {
  en: require("./en"),
  es: require("./es"),
  pt: require("./pt"),
};

const DEFAULT_LOCALE = "en";
const SUPPORTED = Object.keys(catalogs);

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    vars[key] != null ? String(vars[key]) : match,
  );
}

// Translate a key for a locale, falling back to English and then the key itself.
function t(locale, key, vars) {
  const catalog = catalogs[locale] || catalogs[DEFAULT_LOCALE];
  const template = catalog[key] || catalogs[DEFAULT_LOCALE][key] || key;
  return interpolate(template, vars);
}

// Resolve the request locale from the X-Locale header, then Accept-Language.
function localeFromRequest(req) {
  const explicit = String(req.headers["x-locale"] || "")
    .trim()
    .toLowerCase()
    .slice(0, 2);
  if (SUPPORTED.includes(explicit)) return explicit;

  const accept = String(req.headers["accept-language"] || "");
  for (const part of accept.split(",")) {
    const lang = part.split(";")[0].trim().toLowerCase().slice(0, 2);
    if (SUPPORTED.includes(lang)) return lang;
  }
  return DEFAULT_LOCALE;
}

// Map a Zod issue to a localized message. Custom schema messages are authored as
// translation keys ("validation.*"); built-in issues are mapped by their code.
function zodIssueMessage(issue, locale) {
  if (typeof issue.message === "string" && issue.message.startsWith("validation.")) {
    return t(locale, issue.message);
  }
  switch (issue.code) {
    case "invalid_type":
      return t(locale, "validation.common.required");
    case "invalid_string":
      return t(
        locale,
        issue.validation === "email"
          ? "validation.common.invalidEmail"
          : "validation.common.invalid",
      );
    case "too_small":
      return t(locale, "validation.common.minLength");
    case "invalid_enum_value":
      return t(locale, "validation.common.invalidEnum");
    default:
      return t(locale, "validation.common.invalid");
  }
}

module.exports = { t, localeFromRequest, zodIssueMessage, DEFAULT_LOCALE, SUPPORTED };
