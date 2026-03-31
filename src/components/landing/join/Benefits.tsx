"use client"

import {
  BarChart3,
  Dumbbell,
  Users,
  Trophy,
  Globe,
  Building2,
  GraduationCap,
  Gift
} from "lucide-react"

export function Benefits() {

  const benefits = [
    {
      icon: BarChart3,
      title: "Performance Tracking",
      text: "Access a comprehensive platform with clear metrics to track your development and improve your refereeing performance.",
    },
    {
      icon: GraduationCap,
      title: "Continuous Development",
      text: "Weekly training sessions and ongoing education to help you grow consistently as a referee.",
    },
    {
      icon: Globe,
      title: "International Opportunities",
      text: "Possibility to participate in international tournaments and gain exposure beyond local competitions.",
    },
    {
      icon: Dumbbell,
      title: "24/7 Gym Access",
      text: "Train anytime in our private gym facility designed to support referee fitness and performance.",
    },
    {
      icon: Building2,
      title: "Dedicated Facilities",
      text: "Access to CAFLA’s own building for meetings, classes, and training sessions.",
    },
    {
      icon: Users,
      title: "Strong Community",
      text: "Be part of a community of referees where you can share experiences, ask questions, and grow together.",
    },
    {
      icon: Trophy,
      title: "Recognition & Growth",
      text: "Annual awards, recognition programs, and internal competition that motivate continuous improvement.",
    },
    {
      icon: Gift,
      title: "Events & Benefits",
      text: "Enjoy raffles, social events, and community gatherings throughout the year.",
    },
  ]

  return (
    <section className="relative py-24 cafla-section overflow-hidden">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16 max-w-2xl mx-auto">

          <p className="text-sm uppercase tracking-[0.25em] text-yellow-400 mb-4">
            Benefits
          </p>

          <h2 className="text-3xl md:text-4xl text-white font-semibold mb-6">
            Why Join CAFLA
          </h2>

          <p className="text-gray-400 text-lg">
            CAFLA provides the environment, tools, and community to help you grow
            as a referee and take your development to the next level.
          </p>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {benefits.map((item, i) => {
            const Icon = item.icon

            return (
              <div
                key={i}
                className="cafla-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-yellow-400/30 transition"
              >

                <div className="flex flex-col items-start">

                  {/* ICON */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* TITLE */}
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {item.title}
                  </h3>

                  {/* TEXT */}
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.text}
                  </p>

                </div>

              </div>
            )
          })}

        </div>

        {/* FOOTER MESSAGE */}
        <div className="mt-20 text-center max-w-xl mx-auto">

          <p className="text-gray-300 text-lg">
            CAFLA is more than a referee organization — it’s a place to grow,
            compete, and build a long-term career in officiating.
          </p>

        </div>

      </div>

    </section>
  )
}