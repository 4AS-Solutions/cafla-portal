"use client"

import { Square } from "lucide-react"
import { useState } from "react"

type Props = {
  cards: any[]
  reasons: any[]
}

export default function MatchNarrativeSummary({ cards, reasons }: Props) {

  const [openRed, setOpenRed] = useState<string | null>(null)

  if (!cards || cards.length === 0) return null

  const getReasonLabel = (code: string) => {
    const found = reasons?.find((r: any) => r.code === code)
    return found?.label || code
  }

  // 🔥 agrupar por TEAM + PLAYER
  const grouped: Record<string, any[]> = {}

  cards.forEach((c) => {
    if (!c.player_number) return

    const key = `${c.team}-${c.player_number}`

    if (!grouped[key]) {
      grouped[key] = []
    }

    grouped[key].push(c)
  })

  // 🔥 ordenar jugadores por primer evento
  const sortedGroups = Object.entries(grouped).sort((a, b) => {
    const minA = Math.min(...a[1].map((c) => c.minute || 0))
    const minB = Math.min(...b[1].map((c) => c.minute || 0))
    return minA - minB
  })

  return (

    <div className="rounded-xl border border-white/10 bg-black/30 p-5">
      
      <p className="text-sm font-semibold text-gray-300 mb-3">
        Match Summary
      </p>

      <div className="space-y-5">

        {sortedGroups.map(([key, playerCards]) => {

          const [team, number] = key.split("-")

          const sorted = [...playerCards].sort(
            (a, b) => (a.minute || 0) - (b.minute || 0)
          )

          const player = sorted[0]

          const name = player.player_name || "Unknown Player"

          return (
            <div
              key={key}
              className="rounded-lg border border-white/5 bg-black/20 p-4 hover:bg-white/8 transition"
            >

              {/* 🔥 HEADER PLAYER */}
              <div className="flex items-center justify-between mb-3">

                <div className="font-semibold text-white tracking-tight">
                  {name} <span className="text-gray-400">#{number}</span>
                </div>

                {/* TEAM BADGE */}
                <span className={`text-xs px-2 py-1 rounded-full text-[11px] border
                  ${team === "home"
                    ? "border-blue-400/20 text-blue-300 bg-blue-500/10"
                    : "border-red-400/20 text-red-300 bg-red-500/10"
                  }`}
                >
                  {team === "home" ? "Home" : "Away"}
                </span>

              </div>

              {/* 🔥 EVENTS */}
              <div className="space-y-2">

                {sorted.map((c, index) => {

                  if (!c.minute) return null

                  const isYellow = c.card_type === "yellow"
                  const isRed = c.card_type === "red"

                  const reason =
                    c.reason_code === "2CT"
                      ? "Second Caution"
                      : getReasonLabel(c.reason_code)

                  const redKey = `${key}-${index}`

                  return (
                    <div key={index} className="space-y-1">

                      {/* 🔥 ROW */}
                      <div
                        onClick={() =>
                          isRed &&
                          setOpenRed(openRed === redKey ? null : redKey)
                        }
                        className={`flex items-center gap-2 text-sm text-gray-300 rounded-md transition
                          ${isRed ? "cursor-pointer hover:bg-red-500/10" : ""}
                        `}
                      >

                        {/* ICON */}
                        <div className="flex items-center justify-center w-5 h-5">
                          <Square
                            size={14}
                            className={
                              isYellow
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-red-500 fill-red-500"
                            }
                          />
                        </div>

                        {/* MINUTE */}
                        <span className="text-gray-400 w-10">
                          {c.minute}'
                        </span>

                        {/* TEXT */}
                        <span className="flex-1">
                          {reason}
                        </span>

                      </div>

                      {/* 🔴 EXPAND DESCRIPTION */}
                      {isRed && openRed === redKey && (
                        <div className="ml-7 text-xs text-gray-400 border-l border-red-500/20 pl-3">
                          {c.notes || "No description provided"}
                        </div>
                      )}

                    </div>
                  )
                })}

              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}