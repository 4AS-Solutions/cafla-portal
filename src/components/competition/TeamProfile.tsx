"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  Loader2,
  Medal,
  ShieldAlert,
  Target,
  Trophy,
  Users,
} from "lucide-react"

type TeamProfileProps = {
  teamRegistrationId: string
}

type LeaderGoal = {
  playerId: string
  playerName: string
  goals: number
}

type LeaderCaution = {
  playerId: string
  playerName: string
  yellowCards: number
}

type LeaderRed = {
  playerId: string
  playerName: string
  directRedCards: number
  secondYellowReds: number
  totalRedCards: number
}

type TeamProfileResponse = {
  success: boolean
  error?: string

  team: {
    teamRegistrationId: string
    teamId: string
    teamName: string
    position: number
    divisionSeasonId: string
    divisionId: string
    divisionName: string
    seasonId: string
    seasonTerm: string
    seasonYear: number
    seasonLabel: string
  }

  performance: {
    played: number
    won: number
    drawn: number
    lost: number
    forfeits: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    totalPoints: number
  }

  leaders: {
    topScorers: LeaderGoal[]
    mostCautioned: LeaderCaution[]
    mostSentOff: LeaderRed[]
  }

  disciplinaryReasons: Array<{
    playerId: string
    playerName: string
    cardType: string
    reasonCode: string | null
    count: number
  }>

  roster: Array<{
    playerId: string
    externalPlayerId: string | null
    firstName: string
    lastName: string
    playerName: string
  }>
}

function formatGoalDifference(value: number) {
  if (value > 0) return `+${value}`
  return String(value)
}

export default function TeamProfile({
  teamRegistrationId,
}: TeamProfileProps) {
  const [data, setData] =
    useState<TeamProfileResponse | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  useEffect(() => {
    async function loadTeamProfile() {
      setLoading(true)
      setErrorMessage(null)

      try {
        const response = await fetch(
          `/api/competition/teams/${teamRegistrationId}`
        )

        const result =
          (await response.json()) as TeamProfileResponse

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              "Unable to load team profile."
          )
        }

        setData(result)
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load team profile."
        )
      } finally {
        setLoading(false)
      }
    }

    void loadTeamProfile()
  }, [teamRegistrationId])

  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-[#0B0F0F]/80">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading team profile...
        </div>
      </div>
    )
  }

  if (errorMessage || !data) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          {errorMessage ||
            "Unable to load team profile."}
        </span>
      </div>
    )
  }

  const { team, performance, leaders, roster } =
    data

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0B0F0F] to-[#0f241d]">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  {team.teamName}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {team.divisionName} · {team.seasonLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-3 text-center">
              <p className="text-[11px] uppercase tracking-[0.18em] text-yellow-300/70">
                Position
              </p>

              <p className="mt-1 text-2xl font-black text-yellow-300">
                #{team.position}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-center">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                Points
              </p>

              <p className="mt-1 text-2xl font-black text-white">
                {performance.totalPoints}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Played", performance.played],
          ["Won", performance.won],
          ["Drawn", performance.drawn],
          ["Lost", performance.lost],
          ["Goals For", performance.goalsFor],
          ["Goals Against", performance.goalsAgainst],
          [
            "Goal Difference",
            formatGoalDifference(
              performance.goalDifference
            ),
          ],
          ["Forfeits", performance.forfeits],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-5"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
              {label}
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {value}
            </p>
          </div>
        ))}
      </section>

      {/* LEADERS */}
      <section className="grid gap-4 xl:grid-cols-3">
        <LeaderCard
          title="Top Scorers"
          icon={<Target className="h-4 w-4" />}
          emptyText="No goals recorded yet."
        >
          {leaders.topScorers.map(
            (player, index) => (
              <LeaderRow
                key={player.playerId}
                rank={index + 1}
                name={player.playerName}
                value={`${player.goals} goal${
                  player.goals === 1 ? "" : "s"
                }`}
              />
            )
          )}
        </LeaderCard>

        <LeaderCard
          title="Most Cautioned"
          icon={<Medal className="h-4 w-4" />}
          emptyText="No yellow cards recorded yet."
        >
          {leaders.mostCautioned.map(
            (player, index) => (
              <LeaderRow
                key={player.playerId}
                rank={index + 1}
                name={player.playerName}
                value={`${player.yellowCards} YC`}
              />
            )
          )}
        </LeaderCard>

        <LeaderCard
          title="Most Sent Off"
          icon={<ShieldAlert className="h-4 w-4" />}
          emptyText="No red cards recorded yet."
        >
          {leaders.mostSentOff.map(
            (player, index) => (
              <LeaderRow
                key={player.playerId}
                rank={index + 1}
                name={player.playerName}
                value={`${player.totalRedCards} RC`}
              />
            )
          )}
        </LeaderCard>
      </section>

      {/* ROSTER */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/80">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />

            <h3 className="font-semibold text-white">
              Active Roster
            </h3>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
            {roster.length} players
          </span>
        </div>

        {roster.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No active players registered.
          </div>
        ) : (
          <div className="grid gap-px bg-white/5 sm:grid-cols-2 xl:grid-cols-3">
            {roster.map((player) => (
              <div
                key={player.playerId}
                className="bg-[#0B0F0F] px-5 py-4"
              >
                <p className="font-medium text-white">
                  {player.lastName}, {player.firstName}
                </p>

                {player.externalPlayerId && (
                  <p className="mt-1 text-xs text-gray-500">
                    ID: {player.externalPlayerId}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function LeaderCard({
  title,
  icon,
  emptyText,
  children,
}: {
  title: string
  icon: React.ReactNode
  emptyText: string
  children: React.ReactNode
}) {
  const hasChildren =
    Array.isArray(children)
      ? children.length > 0
      : Boolean(children)

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-5">
      <div className="flex items-center gap-2 text-emerald-400">
        {icon}

        <h3 className="font-semibold text-white">
          {title}
        </h3>
      </div>

      <div className="mt-4 space-y-2">
        {hasChildren ? (
          children
        ) : (
          <p className="text-sm text-gray-500">
            {emptyText}
          </p>
        )}
      </div>
    </div>
  )
}

function LeaderRow({
  rank,
  name,
  value,
}: {
  rank: number
  name: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.025] px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-gray-400">
          {rank}
        </span>

        <span className="truncate text-sm font-medium text-white">
          {name}
        </span>
      </div>

      <span className="ml-3 shrink-0 text-xs font-semibold text-yellow-300">
        {value}
      </span>
    </div>
  )
}