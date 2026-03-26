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
import { Button } from "@/src/components/ui/button"

import { formatMatchDate } from "@/src/lib/utils/format-date"

type Member = {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  grade?: string
  category?: string
  years_in_cafla?: number
  created_at: string
}

export default function MembersTable({ members }: { members: Member[] }) {

  if (!members || members.length === 0) {
    return (
      <div className="card-pro p-10 text-center">
        <p className="text-white text-sm font-medium">
          No members found
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (

    <div className="space-y-4">

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-3">

        {members.map((member) => (

          <div
            key={member.id}
            className="
            rounded-xl
            bg-[#0b1513]/70
            border border-emerald-900/40
            backdrop-blur
            shadow-lg shadow-black/30
            p-4 space-y-3
            "
          >

            {/* HEADER */}
            <div className="flex justify-between items-start">

              <div>

                <div className="font-semibold leading-tight">
                  {member.full_name}
                </div>

                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {member.email}
                </div>

              </div>

              {/* ROLE */}
              {member.role === "board" ? (
                <Badge className="rounded-full bg-yellow-400/15 px-3 py-1 text-[10px] font-semibold tracking-wide text-yellow-400 border border-yellow-400/30">
                  {member.role.toUpperCase()}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] px-3 py-1 rounded-full">
                  {member.role.toUpperCase()}
                </Badge>
              )}

            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-3 gap-2 text-xs">

              <div>
                <div className="text-muted-foreground">Grade</div>
                <div>{member.grade ?? "Grassroot"}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Category</div>
                <div>{member.category ?? "N/A"}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Years</div>
                <div>{member.years_in_cafla ?? "0"} yrs</div>
              </div>

            </div>

            {/* STATUS + DATE */}
            <div className="flex justify-between items-center text-xs">

              <div>
                {member.status === "active" && (
                  <Badge variant="success">{member.status.toUpperCase()}</Badge>
                )}

                {member.status === "invited" && (
                  <Badge variant="warning">{member.status.toUpperCase()}</Badge>
                )}

                {member.status === "inactive" && (
                  <Badge variant="danger">{member.status.toUpperCase()}</Badge>
                )}

              </div>

              <div className="text-muted-foreground">
                {formatMatchDate(member.created_at)}
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2">

              <Link href={`/admin/members/${member.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="
                  bg-[#0B0F0F]
                  border-white/10
                  hover:border-yellow-400/40
                  "
                >
                  View
                </Button>
              </Link>

              <Link href={`/admin/members/${member.id}/edit`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="
                  bg-[#0B0F0F]
                  border-white/10
                  hover:border-yellow-400/40
                  "
                >
                  Edit
                </Button>
              </Link>

            </div>

          </div>

        ))}

      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div
        className="
        hidden md:block
        rounded-xl
        bg-[#0b1513]/70
        border border-emerald-900/40
        backdrop-blur
        shadow-lg shadow-black/30
        overflow-hidden
        "
      >

        <Table className="table-fixed w-full">

          <TableHeader>

            <TableRow className="text-xs text-muted-foreground">

              <TableHead className="w-[18%] text-left">Name</TableHead>
              <TableHead className="w-[22%] text-left">Email</TableHead>
              <TableHead className="w-[10%] text-center">Role</TableHead>
              <TableHead className="w-[10%] text-center">Grade</TableHead>
              <TableHead className="w-[8%] text-center">Category</TableHead>
              <TableHead className="w-[8%] text-center">Years</TableHead>
              <TableHead className="w-[10%] text-center">Status</TableHead>
              <TableHead className="w-[10%] text-right">Joined</TableHead>
              <TableHead className="w-[12%] text-right pr-4">Actions</TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>

            {members.map((member) => (

              <TableRow
                key={member.id}
                className="hover:bg-emerald-900/20 transition-colors"
              >

                <TableCell className="font-medium whitespace-nowrap">
                  {member.full_name}
                </TableCell>

                <TableCell className="truncate text-muted-foreground pr-4">
                  {member.email}
                </TableCell>

                <TableCell className="text-center">

                  {member.role === "board" ? (
                    <Badge className="rounded-full bg-yellow-400/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-yellow-400 border border-yellow-400/30">
                      {member.role.toUpperCase()}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
                      {member.role.toUpperCase()}
                    </Badge>
                  )}

                </TableCell>

                <TableCell className="text-center">
                  {member.grade ?? "Grassroot"}
                </TableCell>

                <TableCell className="text-center">
                  {member.category ?? "N/A"}
                </TableCell>

                <TableCell className="text-center whitespace-nowrap">
                  {member.years_in_cafla ?? "0"} yrs
                </TableCell>

                <TableCell className="text-center">

                  {member.status === "active" && (
                    <Badge variant="success">{member.status.toUpperCase()}</Badge>
                  )}

                  {member.status === "invited" && (
                    <Badge variant="warning">{member.status.toUpperCase()}</Badge>
                  )}

                  {member.status === "inactive" && (
                    <Badge variant="danger">{member.status.toUpperCase()}</Badge>
                  )}

                </TableCell>

                <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                  {formatMatchDate(member.created_at)}
                </TableCell>

                <TableCell className="text-right pr-4">

                  <div className="flex justify-end gap-2">

                    <Link href={`/admin/members/${member.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="
                        bg-[#0B0F0F]
                        border-white/10
                        hover:border-yellow-400/40
                        "
                      >
                        View
                      </Button>
                    </Link>

                    <Link href={`/admin/members/${member.id}/edit`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="
                        bg-[#0B0F0F]
                        border-white/10
                        hover:border-yellow-400/40
                        "
                      >
                        Edit
                      </Button>
                    </Link>

                  </div>

                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </div>

    </div>

  )
}