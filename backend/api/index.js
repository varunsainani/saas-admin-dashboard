// Vercel serverless entry. Exports the Express app as a single function (an
// Express app is itself a (req, res) handler). The database schema and seed are
// provisioned out-of-band, so this handler only reads/writes existing tables.
const createApp = require("../src/app");

module.exports = createApp();
