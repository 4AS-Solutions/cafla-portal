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

function getStatusBadge(status: string) {

  switch (status) {

    case "pending":
      return <Badge variant="warning">Pending</Badge>

    case "submitted":
      return <Badge variant="secondary">Submitted</Badge>

    case "revision_required":
      return <Badge variant="danger">Needs Correction</Badge>

    case "approved":
      return <Badge variant="success">Approved</Badge>

    default:
      return <Badge>Unknown</Badge>

  }
}

function getAction(status: string, matchId: string) {

  if (status === "pending") {
    return (
      <Link
        href={`/portal/reports/${matchId}`}
        className="text-sm font-medium text-yellow-400 hover:underline"
      >
        Submit
      </Link>
    )
  }

  if (status === "revision_required") {
    return (
      <Link
        href={`/portal/reports/${matchId}`}
        className="text-sm font-medium text-red-400 hover:underline"
      >
        Fix Report
      </Link>
    )
  }

  return (
    <Link
      href={`/portal/matches/${matchId}`}
      className="text-sm text-blue-400 hover:underline"
    >
      View
    </Link>
  )
}

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

    <div className="border border-white/10 rounded-xl overflow-hidden">

      <Table>

        <TableHeader>
          <TableRow>
            <TableHead>Match</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>

          {reports.map((report) => (

            <TableRow key={report.match_id}>

              <TableCell className="font-medium text-white">

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
                {getStatusBadge(report.status)}
              </TableCell>

              <TableCell className="text-right">
                {getAction(report.status, report.match_id)}
              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </div>
  )
}