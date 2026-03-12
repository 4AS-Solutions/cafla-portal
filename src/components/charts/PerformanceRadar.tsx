"use client"

import { useEffect, useState } from "react"

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const fullData = [
  { metric: "Game Management", short: "GM", score: 88 },
  { metric: "Positioning", short: "POS", score: 85 },
  { metric: "Decision Making", short: "DM", score: 90 },
  { metric: "Communication", short: "COM", score: 92 },
  { metric: "Fitness", short: "FIT", score: 87 },
  { metric: "Rule Knowledge", short: "RK", score: 89 },
  { metric: "Professionalism", short: "PRO", score: 91 },
  { metric: "Teamwork", short: "TW", score: 86 },
  { metric: "Match Control", short: "MC", score: 88 }
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null

  const item = payload[0].payload

  return (
    <div className="bg-[#0B0F0F] border border-white/10 p-3 rounded-lg shadow-lg">

      <p className="text-white text-sm font-semibold">
        {item.metric}
      </p>

      <p className="text-emerald-400 text-sm">
        Performance Score: {item.score}
      </p>

    </div>
  )
}

export default function PerformanceRadar() {

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)

  }, [])

  const chartData = fullData.map(item => ({
    ...item,
    label: isMobile ? item.short : item.metric
  }))

  return (
    <div className="rounded-2xl p-8 md:p-10 bg-gradient-to-br from-[#071f1c] to-[#021312] border border-white/10">

      <h3 className="text-white text-xl font-semibold text-center mb-8">
        Performance Assessment Categories
      </h3>

      <div className="h-[320px] md:h-[380px]">

        <ResponsiveContainer width="100%" height="100%">

          <RadarChart
            data={chartData}
            outerRadius="80%"
          >

            <PolarGrid stroke="rgba(255,255,255,0.1)" />

            <PolarAngleAxis
              dataKey="label"
              stroke="#D1D5DB"
              tick={{ fontSize: 12 }}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={5}
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
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