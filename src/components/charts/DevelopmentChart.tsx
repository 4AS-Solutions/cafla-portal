"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

const data = [
  {
    month: "Jan",
    matches: 0,
    evaluations: 8,
    attendance: 100,
    exams: 88
  },
  {
    month: "Feb",
    matches: 8,
    evaluations: 12,
    attendance: 100,
    exams: 90
  },
  {
    month: "Mar",
    matches: 14,
    evaluations: 15,
    attendance: 95,
    exams: 92
  },
  {
    month: "Apr",
    matches: 22,
    evaluations: 18,
    attendance: 96,
    exams: 94
  },
  {
    month: "May",
    matches: 28,
    evaluations: 21,
    attendance: 97,
    exams: 95
  },
  {
    month: "Jun",
    matches: 40,
    evaluations: 25,
    attendance: 98,
    exams: 96
  }
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null

  const data = payload[0].payload

  return (
    <div className="bg-[#0B0F0F] border border-white/10 p-4 rounded-lg shadow-xl text-sm">

      <p className="font-semibold text-white mb-2">{label}</p>

      <p className="text-emerald-400">
        Matches Officiated : {data.matches}
      </p>

      <p className="text-orange-400">
        Peer Evaluations : {data.evaluations}
      </p>

      <p className="text-blue-400">
        Meeting Attendance % : {data.attendance}
      </p>

      <p className="text-purple-400">
        Exam Scores % : {data.exams}
      </p>

    </div>
  )
}

export default function DevelopmentChart() {
  return (
    <div className="cafla-card rounded-2xl p-10">

      <h3 className="text-xl text-white font-semibold text-center mb-8">
        Your Development Journey
      </h3>

      <div className="h-[340px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid stroke="rgba(255,255,255,0.06)" />

            <XAxis dataKey="month" stroke="#9CA3AF" />

            <YAxis
              stroke="#9CA3AF"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend />

            <Line
              type="monotone"
              dataKey="matches"
              name="Matches Officiated"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4 }}
            />

            <Line
              type="monotone"
              name="Peer Evaluations"
              stroke="#F97316"
            />

            <Line
              type="monotone"
              name="Meeting Attendance %"
              stroke="#3B82F6"
            />

            <Line
              type="monotone"
              name="Exam Scores %"
              stroke="#8B5CF6"
            />

          </LineChart>

        </ResponsiveContainer>

      </div>
    </div>
  )
}