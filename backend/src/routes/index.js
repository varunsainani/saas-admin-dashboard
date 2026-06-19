const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/rbac");
const authC = require("../controllers/authController");
const userC = require("../controllers/userController");
const analyticsC = require("../controllers/analyticsController");
const auditC = require("../controllers/auditController");
const planC = require("../controllers/planController");

const router = express.Router();

// Auth
router.post("/auth/register", authC.register);
router.post("/auth/login", authC.login);
router.post("/auth/refresh", authC.refresh);
router.post("/auth/logout", authC.logout);
router.post("/auth/verify-email", authC.verifyEmail);
router.get("/auth/me", auth, authC.me);

// Users (RBAC enforced)
router.get("/users", auth, userC.list);
router.post("/users", auth, requireRole("ADMIN", "MANAGER"), userC.create);
router.patch("/users/:id", auth, requireRole("ADMIN"), userC.update);
router.delete("/users/:id", auth, requireRole("ADMIN"), userC.remove);

// Analytics + audit
router.get("/analytics/overview", auth, analyticsC.overview);
router.get("/audit", auth, auditC.list);

// Plans + subscription
router.get("/plans", planC.list);
router.get("/subscription", auth, planC.subscription);

module.exports = router;
