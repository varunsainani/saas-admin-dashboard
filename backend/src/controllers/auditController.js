const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/async-handler");

const list = asyncHandler(async (req, res) => {
  const take = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const events = await prisma.auditLog.findMany({
    where: { organizationId: req.auth.orgId },
    orderBy: { createdAt: "desc" },
    take,
    include: { actor: { select: { id: true, name: true, avatarColor: true } } },
  });
  res.json({
    events: events.map((e) => ({
      id: e.id,
      action: e.action,
      target: e.target,
      metadata: e.metadata,
      createdAt: e.createdAt,
      actor: e.actor,
    })),
  });
});

module.exports = { list };
