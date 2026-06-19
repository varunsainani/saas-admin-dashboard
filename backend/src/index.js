require("dotenv").config();

const createApp = require("./app");
const prisma = require("./lib/prisma");

const PORT = process.env.PORT || 4000;
const app = createApp();

async function start() {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}

start();
