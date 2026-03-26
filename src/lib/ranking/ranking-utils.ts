import { Referee } from "@/src/components/admin/ranking/types"
import {
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react"


export function getLevelBadgeStyles(level: string) {
  const normalized = level.toLowerCase()

  if (normalized === "beginner") {
    return "border-white/10 bg-white/5 text-zinc-300"
  }

  if (normalized === "developing") {
    return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
  }

  if (normalized === "advanced") {
    return "border-sky-500/20 bg-sky-500/10 text-sky-300"
  }

  if (normalized === "elite") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
  }

  return "border-white/10 bg-white/5 text-zinc-300"
}

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

export function getOperationalStatus(ref: Referee) {
  const score = Number(ref.development_score)
  const attendance = Number(ref.attendance_score)
  const quiz = Number(ref.quiz_score)
  const feedback = Number(ref.peer_feedback_score)
  const reports = Number(ref.report_score)

  if (attendance === 0 && quiz === 0 && feedback === 0 && reports === 0) {
    return {
      label: "Inactive",
      styles: "border-red-500/20 bg-red-500/10 text-red-300",
    }
  }

  if (attendance < 50 || score < 31) {
    return {
      label: "At Risk",
      styles: "border-red-500/20 bg-red-500/10 text-red-300",
    }
  }

  if (attendance < 70 || quiz < 60 || reports < 40) {
    return {
      label: "Needs Attention",
      styles: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
    }
  }

  return {
    label: "Active",
    styles: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  }
}

export function getFlags(ref: Referee) {
  const flags: string[] = []

  if (Number(ref.attendance_score) < 50) {
    flags.push("Low attendance")
  }

  if (Number(ref.quiz_score) < 60) {
    flags.push("Low quiz score")
  }

  if (Number(ref.peer_feedback_score) < 40) {
    flags.push("Weak feedback")
  }

  if (Number(ref.report_score) < 40) {
    flags.push("Late/missing reports")
  }

  if (
    Number(ref.attendance_score) === 0 &&
    Number(ref.quiz_score) === 0 &&
    Number(ref.peer_feedback_score) === 0 &&
    Number(ref.report_score) === 0
  ) {
    return ["No activity"]
  }

  return flags
}

export function getTrendDisplay(trend: string | null | undefined, diff: number) {
  if (!trend) return null

  if (trend === "up") {
    return {
      icon: TrendingUp,
      color: "text-emerald-300",
      value: `+${diff.toFixed(1)}`,
    }
  }

  if (trend === "down") {
    return {
      icon: TrendingDown,
      color: "text-red-300",
      value: `${diff.toFixed(1)}`,
    }
  }

  if (trend === "same") {
    return {
      icon: Minus,
      color: "text-zinc-400",
      value: "0.0",
    }
  }

  if (trend === "new") {
    return {
      icon: Sparkles,
      color: "text-yellow-300",
      value: "New",
    }
  }

  return null
}