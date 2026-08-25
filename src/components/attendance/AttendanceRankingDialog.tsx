"use client"

import {
  useMemo,
  useState,
} from "react"

import {
  ArrowDownAZ,
  ArrowUpAZ,
  Search,
  Trophy,
  Users,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"

import { Button } from "@/src/components/ui/button"

import type {
  AttendanceRankingRow,
} from "@/src/lib/queries/get-attendance-ranking"

type Props = {
  ranking: AttendanceRankingRow[]
}

type SortMode =
  | "highest"
  | "lowest"

export default function AttendanceRankingDialog({
  ranking,
}: Props) {
  const [
    search,
    setSearch,
  ] = useState("")

  const [
    sortMode,
    setSortMode,
  ] =
    useState<SortMode>(
      "highest"
    )

  const filteredRanking =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase()

      const filtered =
        ranking.filter(
          (item) =>
            item.full_name
              .toLowerCase()
              .includes(
                normalizedSearch
              )
        )

      return [...filtered].sort(
        (a, b) => {
          if (
            sortMode ===
            "highest"
          ) {
            if (
              b.attendance_percentage !==
              a.attendance_percentage
            ) {
              return (
                b.attendance_percentage -
                a.attendance_percentage
              )
            }

            return (
              b.sessions_total -
              a.sessions_total
            )
          }

          if (
            a.attendance_percentage !==
            b.attendance_percentage
          ) {
            return (
              a.attendance_percentage -
              b.attendance_percentage
            )
          }

          return (
            b.sessions_total -
            a.sessions_total
          )
        }
      )
    }, [
      ranking,
      search,
      sortMode,
    ])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="
            border-emerald-500/20
            bg-emerald-500/10
            text-emerald-300
            hover:bg-emerald-500/15
            hover:text-emerald-200
          "
        >
          <Trophy className="mr-2 h-4 w-4" />

          View Attendance Ranking
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          flex
          max-h-[90dvh]
          w-[94vw]
          max-w-6xl
          flex-col
          overflow-hidden
          border-white/10
          bg-[#07110e]
          p-0
          text-white
        "
      >
        <DialogHeader
          className="
            shrink-0
            border-b
            border-white/10
            px-5
            py-5
            sm:px-6
          "
        >
          <DialogTitle
            className="
              flex
              items-center
              gap-2
              text-xl
            "
          >
            <Users
              className="
                h-5
                w-5
                text-emerald-400
              "
            />

            Attendance Ranking
          </DialogTitle>

          <DialogDescription
            className="
              text-slate-400
            "
          >
            Compare referee attendance
            across the active Development
            cycle.
          </DialogDescription>
        </DialogHeader>

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-5
            py-5
            sm:px-6
          "
        >
          {/* CONTROLS */}
          <div
            className="
              mb-5
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div
              className="
                relative
                w-full
                sm:max-w-sm
              "
            >
              <Search
                className="
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-500
                "
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search referee..."
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-black/20
                  pl-9
                  pr-3
                  text-sm
                  outline-none
                  placeholder:text-slate-600
                  focus:border-emerald-500/40
                "
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setSortMode("highest")
                }
                className={
                  sortMode === "highest"
                    ? `
                      border-emerald-500/30
                      bg-emerald-500/15
                      text-emerald-300
                      hover:bg-emerald-500/20
                      hover:text-emerald-200
                    `
                    : `
                      border-white/10
                      bg-white/[0.035]
                      text-slate-400
                      hover:bg-white/[0.07]
                      hover:text-white
                    `
                }
              >
                <ArrowUpAZ className="mr-2 h-4 w-4" />
                Highest
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setSortMode("lowest")
                }
                className={
                  sortMode === "lowest"
                    ? `
                      border-emerald-500/30
                      bg-emerald-500/15
                      text-emerald-300
                      hover:bg-emerald-500/20
                      hover:text-emerald-200
                    `
                    : `
                      border-white/10
                      bg-white/[0.035]
                      text-slate-400
                      hover:bg-white/[0.07]
                      hover:text-white
                    `
                }
              >
                <ArrowDownAZ className="mr-2 h-4 w-4" />
                Lowest
              </Button>
            </div>
          </div>

          {/* DESKTOP */}
          <div
            className="
              hidden
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              md:block
            "
          >
            <table className="w-full">
              <thead
                className="
                  bg-white/[0.035]
                  text-left
                  text-xs
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                <tr>
                  <th className="px-4 py-3">
                    #
                  </th>

                  <th className="px-4 py-3">
                    Referee
                  </th>

                  <th className="px-4 py-3">
                    Attendance
                  </th>

                  <th className="px-4 py-3">
                    Sessions
                  </th>

                  <th className="px-4 py-3">
                    Present
                  </th>

                  <th className="px-4 py-3">
                    Late
                  </th>

                  <th className="px-4 py-3">
                    Excused
                  </th>

                  <th className="px-4 py-3">
                    Absent
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRanking.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={
                        item.member_id
                      }
                      className="
                        border-t
                        border-white/5
                      "
                    >
                      <td
                        className="
                          px-4
                          py-4
                          text-sm
                          text-slate-500
                        "
                      >
                        {index + 1}
                      </td>

                      <td
                        className="
                          px-4
                          py-4
                        "
                      >
                        <p
                          className="
                            font-medium
                            text-white
                          "
                        >
                          {
                            item.full_name
                          }
                        </p>

                        {item.sessions_total <
                          5 && (
                          <p
                            className="
                              mt-1
                              text-xs
                              text-amber-400
                            "
                          >
                            Limited sample
                          </p>
                        )}
                      </td>

                      <td
                        className="
                          px-4
                          py-4
                        "
                      >
                        <span
                          className="
                            text-lg
                            font-semibold
                            text-emerald-300
                          "
                        >
                          {item.attendance_percentage.toFixed(
                            1
                          )}
                          %
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {
                          item.sessions_total
                        }
                      </td>

                      <td className="px-4 py-4">
                        {
                          item.sessions_present
                        }
                      </td>

                      <td className="px-4 py-4">
                        {
                          item.sessions_late
                        }
                      </td>

                      <td className="px-4 py-4">
                        {
                          item.sessions_excused
                        }
                      </td>

                      <td className="px-4 py-4">
                        {
                          item.sessions_absent
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div
            className="
              space-y-3
              md:hidden
            "
          >
            {filteredRanking.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    item.member_id
                  }
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.025]
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >
                    <div>
                      <p
                        className="
                          text-xs
                          text-slate-500
                        "
                      >
                        #{index + 1}
                      </p>

                      <p
                        className="
                          mt-1
                          font-semibold
                          text-white
                        "
                      >
                        {
                          item.full_name
                        }
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-500
                        "
                      >
                        {
                          item.sessions_total
                        }{" "}
                        eligible sessions
                      </p>
                    </div>

                    <p
                      className="
                        text-xl
                        font-bold
                        text-emerald-300
                      "
                    >
                      {item.attendance_percentage.toFixed(
                        1
                      )}
                      %
                    </p>
                  </div>

                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-4
                      gap-2
                      text-center
                    "
                  >
                    <Metric
                      label="Present"
                      value={
                        item.sessions_present
                      }
                    />

                    <Metric
                      label="Late"
                      value={
                        item.sessions_late
                      }
                    />

                    <Metric
                      label="Excused"
                      value={
                        item.sessions_excused
                      }
                    />

                    <Metric
                      label="Absent"
                      value={
                        item.sessions_absent
                      }
                    />
                  </div>

                  {item.sessions_total <
                    5 && (
                    <p
                      className="
                        mt-3
                        text-xs
                        text-amber-400
                      "
                    >
                      Limited sample — only{" "}
                      {
                        item.sessions_total
                      }{" "}
                      eligible session(s).
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div
      className="
        rounded-xl
        bg-black/20
        px-2
        py-2
      "
    >
      <p
        className="
          text-base
          font-semibold
          text-white
        "
      >
        {value}
      </p>

      <p
        className="
          mt-0.5
          text-[10px]
          text-slate-500
        "
      >
        {label}
      </p>
    </div>
  )
}