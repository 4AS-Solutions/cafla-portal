import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

type Match = {
  match_id: string
  home_team: string
  away_team: string
  match_date: string
  field: string
  center_referee: string
}

export function UpcomingMatchesTable({ matches }: { matches: Match[] }) {

  if (!matches || matches.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No upcoming matches.
      </div>
    )
  }

  return (
    <Table>

      <TableHeader>
        <TableRow>
          <TableHead>Match</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Field</TableHead>
          <TableHead>Center Ref</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {matches.map((match) => (
          <TableRow key={match.match_id}>

            <TableCell className="font-medium">
              {match.home_team} vs {match.away_team}
            </TableCell>

            <TableCell>
              {new Date(match.match_date).toLocaleString()}
            </TableCell>

            <TableCell>
              {match.field}
            </TableCell>

            <TableCell>
              {match.center_referee}
            </TableCell>

          </TableRow>
        ))}
      </TableBody>

    </Table>
  )
}