"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

type Props = {
  data: {
    month: string
    score: number
  }[]
}

export function DevelopmentProgressChart({ data }: Props) {

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#ffffff10" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />

          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 5, fill: "#10b981" }}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}