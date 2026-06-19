const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/async-handler");

const list = asyncHandler(async (req, res) => {
  const plans = await prisma.plan.findMany({ orderBy: { priceMonthly: "asc" } });
  res.json({ plans });
});

const subscription = asyncHandler(async (req, res) => {
  const sub = await prisma.subscription.findUnique({
    where: { organizationId: req.auth.orgId },
    include: { plan: true },
  });
  res.json({ subscription: sub });
});

module.exports = { list, subscription };
