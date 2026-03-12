"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const data = [
  { month: "Jan", score: 12 },
  { month: "Feb", score: 18 },
  { month: "Mar", score: 22 },
  { month: "Apr", score: 28 },
  { month: "May", score: 35 },
  { month: "Jun", score: 40 },
]

export default function DevelopmentChart() {
  return (
    <div className="cafla-card p-10 rounded-2xl">

      <h3 className="text-white text-xl font-semibold mb-6 text-center">
        Your Development Journey
      </h3>

      <div className="h-[320px]">

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>

            <CartesianGrid stroke="rgba(255,255,255,0.05)" />

            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />

            <Tooltip
              contentStyle={{
                background: "#0B0F0F",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r: 5 }}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

    </div>
  )
}