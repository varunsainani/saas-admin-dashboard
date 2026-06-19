require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");
const { AVATAR_COLORS } = require("../src/lib/constants");

const PLANS = [
  { name: "Free", priceMonthly: 0, seats: 3, popular: false, features: ["3 team members", "Basic analytics", "7-day activity log", "Community support"] },
  { name: "Starter", priceMonthly: 2900, seats: 10, popular: false, features: ["10 team members", "Full analytics", "30-day activity log", "Role-based access", "Email support"] },
  { name: "Pro", priceMonthly: 7900, seats: 25, popular: true, features: ["25 team members", "Advanced analytics", "1-year activity log", "Role-based access", "Audit trail export", "Priority support"] },
  { name: "Enterprise", priceMonthly: -1, seats: 9999, popular: false, features: ["Unlimited members", "Custom analytics", "Unlimited retention", "SSO & SAML", "Audit trail export", "Dedicated manager", "99.9% uptime SLA"] },
];

// First member is the demo login account.
const MEMBERS = [
  { name: "Alex Morgan", email: "demo@vantage.app", role: "ADMIN", status: "ACTIVE", title: "Founder & CEO", demo: true },
  { name: "Maya Chen", email: "maya@northwind.io", role: "MANAGER", status: "ACTIVE", title: "Head of Product" },
  { name: "Daniel Okafor", email: "daniel@northwind.io", role: "MANAGER", status: "ACTIVE", title: "Engineering Lead" },
  { name: "Priya Nair", email: "priya@northwind.io", role: "USER", status: "ACTIVE", title: "Senior Designer" },
  { name: "Lucas Almeida", email: "lucas@northwind.io", role: "USER", status: "ACTIVE", title: "Backend Engineer" },
  { name: "Sofia Rossi", email: "sofia@northwind.io", role: "MANAGER", status: "ACTIVE", title: "Customer Success" },
  { name: "Noah Williams", email: "noah@northwind.io", role: "USER", status: "ACTIVE", title: "Account Executive" },
  { name: "Emma Thompson", email: "emma@northwind.io", role: "USER", status: "INVITED", title: "Marketing Manager" },
  { name: "Yuki Tanaka", email: "yuki@northwind.io", role: "USER", status: "ACTIVE", title: "Data Analyst" },
  { name: "Omar Haddad", email: "omar@northwind.io", role: "USER", status: "ACTIVE", title: "Support Engineer" },
  { name: "Grace Lee", email: "grace@northwind.io", role: "MANAGER", status: "ACTIVE", title: "Finance Lead" },
  { name: "Tom Becker", email: "tom@northwind.io", role: "USER", status: "SUSPENDED", title: "QA Engineer" },
];

async function main() {
  // Plans
  const planByName = {};
  for (const p of PLANS) {
    planByName[p.name] = await prisma.plan.upsert({
      where: { name: p.name },
      update: { priceMonthly: p.priceMonthly, seats: p.seats, popular: p.popular, features: p.features },
      create: p,
    });
  }

  // Organization
  let org = await prisma.organization.findUnique({ where: { slug: "northwind" } });
  if (!org) org = await prisma.organization.create({ data: { name: "Northwind", slug: "northwind" } });

  // Subscription -> Pro
  await prisma.subscription.upsert({
    where: { organizationId: org.id },
    update: { planId: planByName.Pro.id, status: "ACTIVE", seatsUsed: MEMBERS.length },
    create: {
      organizationId: org.id,
      planId: planByName.Pro.id,
      status: "ACTIVE",
      seatsUsed: MEMBERS.length,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Users
  const demoHash = await bcrypt.hash("demo1234", 10);
  const otherHash = await bcrypt.hash("password123", 10);
  const created = {};
  for (let i = 0; i < MEMBERS.length; i++) {
    const m = MEMBERS[i];
    created[m.email] = await prisma.user.upsert({
      where: { email: m.email },
      update: { name: m.name, role: m.role, status: m.status, title: m.title, organizationId: org.id },
      create: {
        organizationId: org.id,
        name: m.name,
        email: m.email,
        passwordHash: m.demo ? demoHash : otherHash,
        role: m.role,
        status: m.status,
        title: m.title,
        emailVerified: m.status !== "INVITED",
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        lastActiveAt: new Date(Date.now() - i * 60 * 60 * 1000),
      },
    });
  }

  // Audit log (only if empty)
  if ((await prisma.auditLog.count({ where: { organizationId: org.id } })) === 0) {
    const admin = created["demo@vantage.app"];
    const events = [
      { action: "user.invited", target: "Emma Thompson", metadata: { role: "USER" } },
      { action: "user.updated", target: "Lucas Almeida", metadata: { role: "USER" } },
      { action: "billing.updated", target: "Payment method" },
      { action: "auth.login", target: null },
      { action: "billing.upgraded", target: "Pro plan" },
      { action: "settings.exported", target: "Activity log" },
      { action: "user.updated", target: "Tom Becker", metadata: { status: "SUSPENDED" } },
      { action: "security.2fa_enabled", target: null },
    ];
    for (let i = 0; i < events.length; i++) {
      await prisma.auditLog.create({
        data: {
          organizationId: org.id,
          actorId: admin.id,
          ...events[i],
          createdAt: new Date(Date.now() - (i + 1) * 3 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("Seed complete. Demo login: demo@vantage.app / demo1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
