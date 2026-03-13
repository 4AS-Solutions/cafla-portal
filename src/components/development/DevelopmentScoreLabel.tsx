export function getScoreLabel(score: number) {

  if (score >= 85)
    return { label: "Excellent", color: "text-emerald-400" }

  if (score >= 70)
    return { label: "Strong", color: "text-green-400" }

  if (score >= 50)
    return { label: "Average", color: "text-yellow-400" }

  if (score >= 30)
    return { label: "Needs Improvement", color: "text-orange-400" }

  return { label: "Critical", color: "text-red-400" }

}