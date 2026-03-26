export type Referee = {
  id?: string
  ranking_position: number
  full_name: string
  referee_level: string
  development_score: number
  attendance_score: number
  quiz_score: number
  peer_feedback_score: number
  report_score: number
  trend?: string | null
  trendDiff?: number | null
}