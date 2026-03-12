"use client"

import Link from "next/link"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

import { Badge } from "@/src/components/ui/badge"
import type { ReportRow } from "@/src/lib/queries/get-reports"

export default function ReportsTable({
  reports,
}: {
  reports: ReportRow[]
}) {
  if (!reports || reports.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reports submitted yet.
      </p>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Match</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">
                {report.matches
                  ? `${report.matches.home_team} vs ${report.matches.away_team}`
                  : "Match not found"}
              </TableCell>

              <TableCell>
                {report.matches
                  ? new Date(report.matches.kickoff_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "-"}
              </TableCell>

              <TableCell>
                {report.home_score} - {report.away_score}
              </TableCell>

              <TableCell>
                {report.status === "submitted" ? (
                  <Badge variant="success">Submitted</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </TableCell>

              <TableCell>
                <Link
                  href={`/portal/matches/${report.match_id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}