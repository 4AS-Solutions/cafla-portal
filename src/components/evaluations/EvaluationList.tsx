import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"

export function EvaluationList({ evaluations }: { evaluations: any[] }) {

  if (!evaluations.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No pending evaluations.
      </div>
    )
  }

  return (

    <div className="border rounded-lg overflow-hidden">

      <Table>

        <TableHeader>

          <TableRow>
            <TableHead>Match</TableHead>
            <TableHead>Referee</TableHead>
            <TableHead className="text-right">Action</TableHead>
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

              <TableCell className="text-right">

                <Link
                  href={`/portal/evaluations/${e.match_id}?referee=${e.referee_id}`}
                >

                  <Button size="sm">
                    Evaluate
                  </Button>

                </Link>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </div>

  )
}