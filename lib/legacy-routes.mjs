const retired = [
  "dogbreed-classification", "heart-disease", "bulldozer-price", "meal-planner", "workout-planner",
  "aurora-chat", "hr-analytics", "essay-writer", "disaster-nlp", "aws-ml-nanodegree", "stock-terminal", "data-insights-portal",
]

export const legacyIds = ["proj-rag-workbench", ...retired.map(slug => `proj-${slug}`)]

export function legacyProjectTarget(id, activeIds) {
  const resolved = id === "proj-rag-workbench" ? "proj-compliance-workbench" : id
  return activeIds.includes(resolved) ? `/archive/#${resolved}` : "/archive/"
}
