"use client"

import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Shield,
  Trophy,
} from "lucide-react"

import StatusBadge from "../admin/reports/StatusBadge"

type MatchCardProps = {
  match: {
    id: string
    home_team: string
    away_team: string
    league: string
    division: string
    location: string
    field: string
    kickoff_at: string
    report_status: string
  }
}

export default function MatchCard({
  match,
}: MatchCardProps) {

  const router = useRouter()

  return (

    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border border-white/10
        bg-gradient-to-br
        from-[#0B0F0F]
        to-[#0B0F0F]/85
        transition-all
        duration-300
        hover:border-emerald-500/25
        hover:-translate-y-0.5
      "
    >

      {/* HEADER */}

      <div className="p-5">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-start gap-3 min-w-0">

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-emerald-500/20
                bg-emerald-500/10
              "
            >
              <Trophy
                className="
                  h-5
                  w-5
                  text-emerald-400
                "
              />
            </div>

            <div className="min-w-0">

              <h3
                className="
                  truncate
                  text-base
                  font-semibold
                  text-white
                "
              >
                {match.home_team} vs {match.away_team}
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-400
                "
              >
                {match.league}
              </p>

            </div>

          </div>

          <StatusBadge
            status={match.report_status}
          />

        </div>

      </div>

      {/* DIVIDER */}

      <div className="h-px bg-white/5" />

      {/* BODY */}

      <div className="p-5 space-y-4">

        <div className="grid gap-3">

          <div className="flex items-center gap-3">

            <Shield
              className="
                h-4
                w-4
                text-emerald-400
              "
            />

            <div>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.15em]
                  text-gray-500
                "
              >
                Division
              </p>

              <p
                className="
                  text-sm
                  text-white
                "
              >
                {match.division}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <CalendarDays
              className="
                h-4
                w-4
                text-emerald-400
              "
            />

            <div>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.15em]
                  text-gray-500
                "
              >
                Kickoff
              </p>

              <p
                className="
                  text-sm
                  text-white
                "
              >
                {formatDate(match.kickoff_at)}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <MapPin
              className="
                h-4
                w-4
                text-emerald-400
              "
            />

            <div>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.15em]
                  text-gray-500
                "
              >
                Venue
              </p>

              <p
                className="
                  text-sm
                  text-white
                "
              >
                {match.location}
              </p>

              <p
                className="
                  text-xs
                  text-gray-400
                "
              >
                {match.field}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* FOOTER */}

      <div
        className="
          border-t
          border-white/5
          p-4
        "
      >

        <button
          onClick={() =>
            router.push(`/admin/matches/${match.id}`)
          }
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-white/[0.02]
            px-4
            py-2.5
            text-sm
            font-medium
            text-white
            transition-all
            duration-200
            hover:border-emerald-500/30
            hover:bg-emerald-500/10
          "
        >

          View Match

          <ArrowUpRight
            className="
              h-4
              w-4
              transition-transform
              duration-200
              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
            "
          />

        </button>

      </div>

    </article>

  )
}

function formatDate(date: string) {

  if (!date) return "No date"

  return new Date(date).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  )

}