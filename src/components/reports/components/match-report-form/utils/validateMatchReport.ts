import type {
  Card,
  Goal,
  MatchReportFormData,
} from "../match-report.types"

export type MatchReportValidationSection = "goal" | "card"

export type MatchReportValidationField = keyof Goal | keyof Card

export type MatchReportValidationError = {
  section: MatchReportValidationSection
  row: number
  field: MatchReportValidationField
  message: string
}

export type MatchReportValidationResult = {
  valid: boolean
  errors: MatchReportValidationError[]
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function hasValidMinute(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  )
}

function validateGoal(
  goal: Goal,
  index: number,
  errors: MatchReportValidationError[]
) {
  const row = index + 1

  if (!hasText(goal.player_name)) {
    errors.push({
      section: "goal",
      row,
      field: "player_name",
      message: "Player name is required.",
    })
  }

  if (!hasText(goal.player_number)) {
    errors.push({
      section: "goal",
      row,
      field: "player_number",
      message: "Player number is required.",
    })
  }

  if (!hasValidMinute(goal.minute)) {
    errors.push({
      section: "goal",
      row,
      field: "minute",
      message: "A valid minute is required.",
    })
  }

  if (goal.team !== "home" && goal.team !== "away") {
    errors.push({
      section: "goal",
      row,
      field: "team",
      message: "Team is required.",
    })
  }

  if (goal.half !== "first" && goal.half !== "second") {
    errors.push({
      section: "goal",
      row,
      field: "half",
      message: "Half is required.",
    })
  }

  if (
    goal.goal_type !== "normal" &&
    goal.goal_type !== "penalty" &&
    goal.goal_type !== "own_goal"
  ) {
    errors.push({
      section: "goal",
      row,
      field: "goal_type",
      message: "Goal type is required.",
    })
  }
}

function validateCard(
  card: Card,
  index: number,
  errors: MatchReportValidationError[]
) {
  const row = index + 1

  if (!hasText(card.player_name)) {
    errors.push({
      section: "card",
      row,
      field: "player_name",
      message: "Player name is required.",
    })
  }

  if (!hasText(card.player_number)) {
    errors.push({
      section: "card",
      row,
      field: "player_number",
      message: "Player number is required.",
    })
  }

  if (!hasValidMinute(card.minute)) {
    errors.push({
      section: "card",
      row,
      field: "minute",
      message: "A valid minute is required.",
    })
  }

  if (card.team !== "home" && card.team !== "away") {
    errors.push({
      section: "card",
      row,
      field: "team",
      message: "Team is required.",
    })
  }

  if (card.card_type !== "yellow" && card.card_type !== "red") {
    errors.push({
      section: "card",
      row,
      field: "card_type",
      message: "Card type is required.",
    })
  }

  if (!hasText(card.reason_code)) {
    errors.push({
      section: "card",
      row,
      field: "reason_code",
      message: "Card reason is required.",
    })
  }

  if (card.card_type === "red" && !hasText(card.notes)) {
    errors.push({
      section: "card",
      row,
      field: "notes",
      message: "Red cards require a description.",
    })
  }
}

export function validateMatchReport(
  data: MatchReportFormData
): MatchReportValidationResult {
  const errors: MatchReportValidationError[] = []

  ;(data.goals ?? []).forEach((goal, index) => {
    validateGoal(goal, index, errors)
  })

  ;(data.cards ?? []).forEach((card, index) => {
    validateCard(card, index, errors)
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}