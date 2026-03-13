"use client"

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts"

type Props = {
  data: {
    skill: string
    score: number
  }[]
}

export function AssessmentRadar({ data }: Props) {

  return (
    <div className="h-[340px] w-full">

      <ResponsiveContainer>

        <RadarChart data={data}>

          <PolarGrid stroke="#ffffff20" />

          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "#d1d5db", fontSize: 12 }}
          />

          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
          />

          <Radar
            dataKey="score"
            stroke="#facc15"
            fill="#facc15"
            fillOpacity={0.35}
          />

        </RadarChart>

      </ResponsiveContainer>

    </div>
  )
}