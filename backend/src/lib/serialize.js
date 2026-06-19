// Strips sensitive fields (passwordHash) before sending a user to the client.
function publicUser(u) {
  return {
    id: u.id,
    organizationId: u.organizationId,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    emailVerified: u.emailVerified,
    title: u.title,
    avatarColor: u.avatarColor,
    lastActiveAt: u.lastActiveAt,
    createdAt: u.createdAt,
  };
}

module.exports = { publicUser };
