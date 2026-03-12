"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

import { Badge } from "@/src/components/ui/badge"

type Member = {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

export default function MembersTable({
  members,
}: {
  members: Member[]
}) {

  if (!members || members.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No members found.
      </div>
    )
  }

  return (

    <div className="border rounded-lg overflow-hidden">

      <Table>

        <TableHeader>

          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>

        </TableHeader>

        <TableBody>

          {members.map((member) => (

            <TableRow key={member.id}>

              <TableCell className="font-medium">
                {member.full_name}
              </TableCell>

              <TableCell>
                {member.email}
              </TableCell>

              <TableCell>

                {member.role === "board" ? (
                  <Badge variant="default">
                    Board
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Referee
                  </Badge>
                )}

              </TableCell>

              <TableCell>
                {new Date(member.created_at).toLocaleDateString()}
              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </div>
  )
}