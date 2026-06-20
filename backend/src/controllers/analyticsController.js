const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/async-handler");

// Build a 12-month team-growth series from member createdAt dates. Each bucket
// carries new members that month and the running team total, so the dashboard
// can plot real growth instead of fabricated numbers.
function buildSeries(dates, monthsBack = 12) {
  const now = new Date();
  const buckets = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ year: d.getFullYear(), month: d.getMonth(), newMembers: 0 });
  }
  const windowStart = new Date(buckets[0].year, buckets[0].month, 1);
  let baseline = 0; // members who joined before the visible window
  for (const raw of dates) {
    const d = new Date(raw);
    if (d < windowStart) {
      baseline++;
      continue;
    }
    const b = buckets.find((x) => x.year === d.getFullYear() && x.month === d.getMonth());
    if (b) b.newMembers++;
  }
  let cumulative = baseline;
  return buckets.map((b) => {
    cumulative += b.newMembers;
    return { monthIndex: b.month, newMembers: b.newMembers, totalMembers: cumulative };
  });
}

const overview = asyncHandler(async (req, res) => {
  const orgId = req.auth.orgId;
  const [total, active, invited, suspended, admins, managers, members, sub, users] =
    await Promise.all([
      prisma.user.count({ where: { organizationId: orgId } }),
      prisma.user.count({ where: { organizationId: orgId, status: "ACTIVE" } }),
      prisma.user.count({ where: { organizationId: orgId, status: "INVITED" } }),
      prisma.user.count({ where: { organizationId: orgId, status: "SUSPENDED" } }),
      prisma.user.count({ where: { organizationId: orgId, role: "ADMIN" } }),
      prisma.user.count({ where: { organizationId: orgId, role: "MANAGER" } }),
      prisma.user.count({ where: { organizationId: orgId, role: "USER" } }),
      prisma.subscription.findUnique({ where: { organizationId: orgId }, include: { plan: true } }),
      prisma.user.findMany({ where: { organizationId: orgId }, select: { createdAt: true } }),
    ]);

  res.json({
    members: { total, active, invited, suspended },
    roles: { ADMIN: admins, MANAGER: managers, USER: members },
    subscription: sub
      ? {
          plan: sub.plan.name,
          status: sub.status,
          seatsUsed: sub.seatsUsed,
          seats: sub.plan.seats,
          currentPeriodEnd: sub.currentPeriodEnd,
        }
      : null,
    series: buildSeries(users.map((u) => u.createdAt)),
  });
});

module.exports = { overview };
