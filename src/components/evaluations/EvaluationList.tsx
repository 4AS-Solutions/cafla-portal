import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

export function EvaluationList({ evaluations }: { evaluations: any[] }) {

  if (!evaluations.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No pending evaluations.
      </div>
    )
  }

  return (
    <Table>

      <TableHeader>
        <TableRow>
          <TableHead>Match</TableHead>
          <TableHead>Referee</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>

        {evaluations.map((e, i) => (
          <TableRow key={i}>

            <TableCell>
              {e.home_team} vs {e.away_team}
            </TableCell>

            <TableCell>
              {e.referee_name}
            </TableCell>

            <TableCell>
              <Link
                href={`/portal/evaluations/${e.match_id}?referee=${e.referee_id}`}
                className="text-primary underline text-sm"
              >
                Evaluate
              </Link>
            </TableCell>

          </TableRow>
        ))}

      </TableBody>

    </Table>
  )
}