"use client"

import { useEffect, useState } from "react"

import {
  ClipboardCheck,
  BookOpen,
  Users,
  BarChart3,
  Target,
  Trophy,
} from "lucide-react"

import PerformanceRadar from "../charts/PerformanceRadar"
import DevelopmentChart from "../charts/DevelopmentChart"

export function DevelopmentPlan() {

  const features = [
    {
      icon: ClipboardCheck,
      title: "Match Management",
      desc: "Track and register every officiated match with detailed performance data.",
    },
    {
      icon: BookOpen,
      title: "Education Tools",
      desc: "Access exams, laws of the game resources, and continuous training material.",
    },
    {
      icon: Users,
      title: "Peer Evaluations",
      desc: "Receive constructive feedback from fellow referees and mentors.",
    },
    {
      icon: BarChart3,
      title: "Performance Ranking",
      desc: "Monitor development through data-driven performance metrics.",
    },
  ]

  const developmentScore = 92

  const metrics = [
    { label: "Matches Officiated", value: 40, color: "text-emerald-400" },
    { label: "Peer Evaluations", value: 25, color: "text-yellow-400" },
    { label: "Attendance", value: 20, color: "text-blue-400" },
    { label: "Exam Scores", value: 7, color: "text-purple-400" },
  ]

  const [score, setScore] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 800
    const increment = developmentScore / (duration / 16)

    const counter = setInterval(() => {
      start += increment
      if (start >= developmentScore) {
        setScore(developmentScore)
        clearInterval(counter)
      } else {
        setScore(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(counter)
  }, [])

  return (
    <section
      id="development"
      className="relative py-28 cafla-section overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}

        <div className="text-center mb-20">

          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
            Referee Development Platform
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            CAFLA introduces a modern digital platform designed to track,
            evaluate, and develop referees using performance data and
            structured mentorship.
          </p>

        </div>


        {/* FEATURE CARDS */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">

          {features.map((feature, i) => {
            const Icon = feature.icon

            return (
              <div
                key={i}
                className="cafla-card p-8 rounded-xl hover:scale-[1.04] hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-5 text-yellow-400">
                  <Icon size={32} />
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-400 text-sm">
                  {feature.desc}
                </p>
              </div>
            )
          })}
        </div>


        {/* DEVELOPMENT SCORE */}

        <div className="text-center mb-24">

          <div className="inline-flex flex-col items-center">

            <div className="text-6xl md:text-7xl font-bold text-emerald-400 mb-4 tracking-tight">
              {score}
            </div>

            <p className="text-white text-lg font-semibold mb-3">
              Referee Development Score
            </p>

            <p className="text-gray-400 text-sm max-w-md mb-10">
              Calculated from referee evaluations, match activity,
              meeting attendance, and knowledge assessments.
            </p>

            {/* METRICS */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-xl">

              {metrics.map((m, i) => (
                <div
                  key={i}
                  className="text-center"
                >
                  <div className={`text-2xl font-bold ${m.color}`}>
                    {m.value}
                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    {m.label}
                  </p>
                </div>
              ))}

            </div>

          </div>

        </div>


        {/* CHARTS */}

        <div className="grid lg:grid-cols-2 gap-16 mb-24">

          <DevelopmentChart />

          <PerformanceRadar />

        </div>


        {/* DEVELOPMENT JOURNEY */}

        <div className="cafla-card p-10 rounded-2xl mb-20">

          <h3 className="text-2xl font-semibold text-white text-center mb-10">
            Referee Development Journey
          </h3>

          <div className="grid md:grid-cols-4 gap-10 text-center">

            <div>
              <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-4 text-white font-bold">
                1
              </div>

              <h4 className="text-white font-semibold mb-2">
                Register Matches
              </h4>

              <p className="text-gray-400 text-sm">
                Log every officiated match and record your experience.
              </p>
            </div>


            <div>
              <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center mx-auto mb-4 text-black font-bold">
                2
              </div>

              <h4 className="text-white font-semibold mb-2">
                Receive Evaluations
              </h4>

              <p className="text-gray-400 text-sm">
                Get feedback from fellow referees and instructors.
              </p>
            </div>


            <div>
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4 text-white font-bold">
                3
              </div>

              <h4 className="text-white font-semibold mb-2">
                Take Knowledge Exams
              </h4>

              <p className="text-gray-400 text-sm">
                Strengthen your understanding of the Laws of the Game.
              </p>
            </div>


            <div>
              <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-4 text-white font-bold">
                4
              </div>

              <h4 className="text-white font-semibold mb-2">
                Track Your Progress
              </h4>

              <p className="text-gray-400 text-sm">
                Monitor rankings, growth, and performance analytics.
              </p>
            </div>

          </div>

        </div>


        {/* BENEFITS */}

        <div className="grid md:grid-cols-3 gap-8">

          <div className="cafla-card p-10 rounded-xl text-center hover:scale-[1.03] transition">

            <Trophy className="mx-auto text-yellow-400 mb-4" size={40} />

            <h4 className="text-white text-xl font-semibold mb-2">
              Data-Driven Growth
            </h4>

            <p className="text-gray-400">
              Objective metrics help referees understand strengths and
              development areas.
            </p>

          </div>


          <div className="cafla-card p-10 rounded-xl text-center hover:scale-[1.03] transition">

            <Target className="mx-auto text-emerald-400 mb-4" size={40} />

            <h4 className="text-white text-xl font-semibold mb-2">
              Personalized Progress
            </h4>

            <p className="text-gray-400">
              Each referee follows a structured development pathway.
            </p>

          </div>


          <div className="cafla-card p-10 rounded-xl text-center hover:scale-[1.03] transition">

            <BarChart3 className="mx-auto text-blue-400 mb-4" size={40} />

            <h4 className="text-white text-xl font-semibold mb-2">
              Performance Analytics
            </h4>

            <p className="text-gray-400">
              Rankings, evaluations, and match history create a complete
              development profile.
            </p>

          </div>

        </div>

      </div>
    </section>
  )
}