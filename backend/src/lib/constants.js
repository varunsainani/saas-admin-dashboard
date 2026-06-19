const AVATAR_COLORS = [
  "#6366f1",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
  "#14b8a6",
  "#ec4899",
  "#3b82f6",
  "#f97316",
];

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

module.exports = { AVATAR_COLORS, randomColor };
