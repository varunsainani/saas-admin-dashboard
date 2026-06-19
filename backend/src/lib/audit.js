const prisma = require("./prisma");

// Best-effort audit logging: never let an audit write break the main request.
async function logAudit({ orgId, actorId, action, target, metadata, ip }) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        actorId: actorId ?? null,
        action,
        target: target ?? null,
        metadata: metadata ?? undefined,
        ip: ip ?? null,
      },
    });
  } catch (err) {
    console.error("audit log failed:", err.message);
  }
}

module.exports = { logAudit };
