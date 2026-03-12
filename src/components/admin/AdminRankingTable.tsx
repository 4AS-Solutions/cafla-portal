import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

type Referee = {
  ranking_position: number
  full_name: string
  referee_level: string
  development_score: number
  attendance_score: number
  quiz_score: number
  peer_feedback_score: number
  report_score: number
}

export function AdminRankingTable({ referees }: { referees: Referee[] }) {

  if (!referees || referees.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No ranking data available.
      </div>
    )
  }

  return (
    <Table>

      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Referee</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Attendance</TableHead>
          <TableHead>Quiz</TableHead>
          <TableHead>Feedback</TableHead>
          <TableHead>Reports</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>

        {referees.map((ref) => (

          <TableRow key={ref.full_name}>

            <TableCell className="font-medium">
              #{ref.ranking_position}
            </TableCell>

            <TableCell>
              {ref.full_name}
            </TableCell>

            <TableCell>
              {ref.referee_level}
            </TableCell>

            <TableCell>
              {Number(ref.development_score).toFixed(1)}
            </TableCell>

            <TableCell>
              {Number(ref.attendance_score).toFixed(0)}%
            </TableCell>

            <TableCell>
              {Number(ref.quiz_score).toFixed(0)}%
            </TableCell>

            <TableCell>
              {Number(ref.peer_feedback_score).toFixed(0)}%
            </TableCell>

            <TableCell>
              {Number(ref.report_score).toFixed(0)}%
            </TableCell>

          </TableRow>

        ))}

      </TableBody>

    </Table>
  )
}