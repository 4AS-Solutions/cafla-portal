"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer
} from "recharts"

const data = [
  { subject: "Game Management", value: 85 },
  { subject: "Positioning", value: 80 },
  { subject: "Decision Making", value: 88 },
  { subject: "Communication", value: 90 },
  { subject: "Fitness", value: 84 },
  { subject: "Rule Knowledge", value: 89 },
]

export default function PerformanceRadar() {
  return (
    <div className="rounded-2xl p-10 bg-gradient-to-br from-[#071f1c] to-[#021312] border border-white/10">

      <h3 className="text-white text-xl font-semibold mb-8 text-center">
        Performance Assessment Categories
      </h3>

      <div className="h-[360px]">

        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>

            <PolarGrid stroke="rgba(255,255,255,0.1)" />

            <PolarAngleAxis
              dataKey="subject"
              stroke="#9CA3AF"
            />

            <Radar
              name="Performance"
              dataKey="value"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.5}
            />

          </RadarChart>
        </ResponsiveContainer>

      </div>

    </div>
  )
}