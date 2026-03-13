"use client"

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts"

import { getScoreLabel } from "./DevelopmentScoreLabel"

type Props = {
  data: {
    skill: string
    score: number
  }[]
}

export function DevelopmentRadar({ data }: Props) {

  return (
    <div className="space-y-6">

      <div className="h-[340px] w-full py-4">

        <ResponsiveContainer>

          <RadarChart data={data}>

            <PolarGrid stroke="#ffffff10" />

            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "#d1d5db", fontSize: 12 }}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "#9ca3af", fontSize: 10 }}
            />

            <Radar
              dataKey="score"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.55}
              strokeWidth={2}
            />

          </RadarChart>

        </ResponsiveContainer>

      </div>


      {/* Interpretation */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">

        {data.map((item) => {

          const interpretation = getScoreLabel(item.score)

          return (
            <div
              key={item.skill}
              className="flex flex-col bg-black/20 border border-white/10 rounded-lg p-3"
            >
              <span className="text-xs text-gray-400">
                {item.skill}
              </span>

              <span className="text-sm font-semibold text-white">
                {item.score.toFixed(0)}%
              </span>

              <span className={`text-xs ${interpretation.color}`}>
                {interpretation.label}
              </span>
            </div>
          )
        })}

      </div>

    </div>
  )
}