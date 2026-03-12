"use client"

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const data = [
  { metric: "Game Management", score: 88 },
  { metric: "Positioning", score: 85 },
  { metric: "Decision Making", score: 90 },
  { metric: "Communication", score: 92 },
  { metric: "Fitness", score: 87 },
  { metric: "Rule Knowledge", score: 89 },
  { metric: "Professionalism", score: 91 },
  { metric: "Teamwork", score: 86 },
  { metric: "Match Control", score: 88 }
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload) return null

  const item = payload[0].payload

  return (
    <div className="bg-[#0B0F0F] border border-white/10 p-3 rounded-lg">

      <p className="text-white text-sm font-semibold">
        {item.metric}
      </p>

      <p className="text-emerald-400 text-sm">
        Performance Score : {item.score}
      </p>

    </div>
  )
}

export default function PerformanceRadar() {
  return (
    <div className="rounded-2xl p-10 bg-gradient-to-br from-[#071f1c] to-[#021312] border border-white/10">

      <h3 className="text-white text-xl font-semibold text-center mb-8">
        Performance Assessment Categories
      </h3>

      <div className="h-[380px]">

        <ResponsiveContainer width="100%" height="100%">

          <RadarChart data={data}>

            <PolarGrid stroke="rgba(255,255,255,0.1)" />

            <PolarAngleAxis
              dataKey="metric"
              stroke="#D1D5DB"
              tick={{ fontSize: 12 }}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={5}
            />

            <Tooltip content={<CustomTooltip />} />

            <Radar
              dataKey="score"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.55}
            />

          </RadarChart>

        </ResponsiveContainer>

      </div>
    </div>
  )
}