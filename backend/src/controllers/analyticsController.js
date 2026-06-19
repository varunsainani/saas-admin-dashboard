const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/async-handler");

const overview = asyncHandler(async (req, res) => {
  const orgId = req.auth.orgId;
  const [total, active, invited, suspended, admins, managers, members, sub] = await Promise.all([
    prisma.user.count({ where: { organizationId: orgId } }),
    prisma.user.count({ where: { organizationId: orgId, status: "ACTIVE" } }),
    prisma.user.count({ where: { organizationId: orgId, status: "INVITED" } }),
    prisma.user.count({ where: { organizationId: orgId, status: "SUSPENDED" } }),
    prisma.user.count({ where: { organizationId: orgId, role: "ADMIN" } }),
    prisma.user.count({ where: { organizationId: orgId, role: "MANAGER" } }),
    prisma.user.count({ where: { organizationId: orgId, role: "USER" } }),
    prisma.subscription.findUnique({ where: { organizationId: orgId }, include: { plan: true } }),
  ]);

  res.json({
    users: { total, active, invited, suspended },
    roles: { ADMIN: admins, MANAGER: managers, USER: members },
    subscription: sub
      ? { plan: sub.plan.name, status: sub.status, seatsUsed: sub.seatsUsed, seats: sub.plan.seats }
      : null,
  });
});

module.exports = { overview };
