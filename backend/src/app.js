const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middleware/error");
const locale = require("./middleware/locale");

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
  app.use(express.json());
  app.use(locale);

  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api", routes);

  app.use(errorHandler);
  return app;
}

module.exports = createApp;
