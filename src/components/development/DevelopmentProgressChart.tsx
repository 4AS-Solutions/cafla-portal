"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { MonthlyDevelopmentRanking } from "@/src/lib/queries/get-development-ranking-v2"

function formatMonth(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})/)
  if (!match) return value

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)))
}

export function DevelopmentProgressChart({
  data,
}: {
  data: MonthlyDevelopmentRanking[]
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
        No monthly development history is available yet.
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#ffffff10" />
          <XAxis dataKey="month_start" tickFormatter={formatMonth} tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <Tooltip
            labelFormatter={(label) => formatMonth(String(label))}
            formatter={(value, name, item) => {
              if (name === "monthly_development_score") {
                const payload = item.payload as MonthlyDevelopmentRanking
                const detail = payload.ranking_position === null
                  ? "Not Ranked"
                  : `Rank #${payload.ranking_position}`
                return [`${Number(value).toFixed(2)}% · ${detail}`, "Development"]
              }
              return [value, name]
            }}
          />
          <Line
            type="monotone"
            dataKey="monthly_development_score"
            stroke="#10b981"
            strokeWidth={3}
            connectNulls={false}
            dot={{ r: 5, fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
