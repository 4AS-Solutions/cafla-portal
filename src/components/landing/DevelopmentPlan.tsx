"use client"

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

  return (
    <section
      id="development"
      className="relative py-28 cafla-section overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* header */}

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


        {/* feature cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">

          {features.map((feature, i) => {
            const Icon = feature.icon

            return (
              <div
                key={i}
                className="cafla-card p-8 rounded-xl hover:scale-[1.03] transition"
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


        <div className="grid lg:grid-cols-2 gap-16 mb-24">

          <DevelopmentChart />

          <PerformanceRadar />

        </div>


        {/* development journey */}

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


        {/* benefits */}

        <div className="grid md:grid-cols-3 gap-8">

          <div className="cafla-card p-10 rounded-xl text-center">

            <Trophy className="mx-auto text-yellow-400 mb-4" size={40} />

            <h4 className="text-white text-xl font-semibold mb-2">
              Data-Driven Growth
            </h4>

            <p className="text-gray-400">
              Objective metrics help referees understand their strengths
              and development areas.
            </p>

          </div>


          <div className="cafla-card p-10 rounded-xl text-center">

            <Target className="mx-auto text-emerald-400 mb-4" size={40} />

            <h4 className="text-white text-xl font-semibold mb-2">
              Personalized Progress
            </h4>

            <p className="text-gray-400">
              Each referee follows a structured development pathway.
            </p>

          </div>


          <div className="cafla-card p-10 rounded-xl text-center">

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