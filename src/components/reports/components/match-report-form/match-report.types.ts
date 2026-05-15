export type Goal = {
  team: "home" | "away"
  player_name: string
  player_number: string
  minute: number
  half: "first" | "second"
  goal_type: "normal" | "penalty" | "own_goal"
  player_id?: string
}

export type Card = {
  team: "home" | "away"
  player_name: string
  player_number: string
  minute: number
  card_type: "yellow" | "red"
  reason_code: string
  notes?: string
  auto_generated?: boolean
  player_id?: string
}

export type MatchReportFormData = {
  home_score: number
  away_score: number
  comments: string
  goals: Goal[]
  cards: Card[]
}