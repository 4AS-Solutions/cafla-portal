export function getScoreTone(score: number) {
  if (score >= 76) {
    return {
      text: "text-emerald-300",
      bar: "bg-emerald-400",
      ring: "shadow-emerald-500/20",
    }
  }

  if (score >= 51) {
    return {
      text: "text-sky-300",
      bar: "bg-sky-400",
      ring: "shadow-sky-500/20",
    }
  }

  if (score >= 31) {
    return {
      text: "text-yellow-300",
      bar: "bg-yellow-400",
      ring: "shadow-yellow-500/20",
    }
  }

  return {
    text: "text-zinc-300",
    bar: "bg-zinc-400",
    ring: "shadow-zinc-500/20",
  }
}
