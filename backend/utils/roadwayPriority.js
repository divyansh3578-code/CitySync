const HIGH_PRIORITY = ["ACCIDENT", "SIGNAL", "ROAD_DAMAGE"];

export default function getRoadwaysPriority(category, frequency) {
  const type = category.toUpperCase();

  // 🔴 Always HIGH (critical issues)
  if (HIGH_PRIORITY.includes(type)) {
    return "HIGH";
  }

  // 🟡 Conditional escalation logic

  if (type === "POTHOLE") {
    return frequency > 2 ? "HIGH" : "MEDIUM";
  }

  if (type === "TRAFFIC") {
    return frequency > 3 ? "HIGH" : "MEDIUM";
  }

  if (type === "WATERLOGGING") {
    return frequency > 2 ? "HIGH" : "MEDIUM";
  }

  // 🟢 Default fallback
  return "LOW";
}
