"use client"

import {
  GraduationCap,
  ClipboardCheck,
  Users,
  Dumbbell,
  Building2,
  Globe,
  Trophy,
  TrendingUp,
} from "lucide-react"

export function DevelopmentEnvironment() {

  const benefits = [
    {
      icon: GraduationCap,
      title: "Structured Instruction",
      text: "Weekly referee education focused on Laws of the Game, match analysis, positioning, communication, and long-term officiating development.",
    },
    {
      icon: ClipboardCheck,
      title: "Match Assignments",
      text: "Referees receive officiating opportunities that support progressive development through competitive match experience and evaluation.",
    },
    {
      icon: Users,
      title: "Mentorship & Evaluation",
      text: "Experienced referees and instructors provide guidance, mentorship, assessments, and feedback to help members improve consistently.",
    },
    {
      icon: Dumbbell,
      title: "Fitness Preparation",
      text: "CAFLA provides access to referee-focused fitness preparation, including on-site gym facilities and physical training opportunities.",
    },
    {
      icon: Building2,
      title: "Dedicated Training Facility",
      text: "CAFLA operates its own facility for instructional sessions, meetings, referee development activities, and organizational operations.",
    },
    {
      icon: Globe,
      title: "Official Referee Pathway",
      text: "Members develop within a structured environment aligned with USSF and Cal South referee standards and advancement pathways.",
    },
    {
      icon: Trophy,
      title: "Competitive Opportunities",
      text: "Referees may participate in competitive tournaments, advanced match environments, and higher-level officiating opportunities as they progress.",
    },
    {
      icon: TrendingUp,
      title: "Long-Term Development",
      text: "CAFLA emphasizes continuous improvement, accountability, professionalism, and long-term referee growth at every stage of development.",
    },
  ]

  return (
    <section className="relative py-24 cafla-section overflow-hidden">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16 max-w-3xl mx-auto">

          <p className="text-sm uppercase tracking-[0.25em] text-yellow-400 mb-4">
            Development Environment
          </p>

          <h2 className="text-3xl md:text-4xl text-white font-semibold mb-6">
            What CAFLA Provides
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed">
            CAFLA provides the structure, training environment, mentorship,
            and resources necessary for long-term referee development.
          </p>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {benefits.map((item, i) => {

            const Icon = item.icon

            return (

              <div
                key={i}
                className="
                  cafla-card
                  p-8
                  rounded-3xl
                  border border-white/10
                  bg-white/5
                  backdrop-blur-md
                  hover:border-yellow-400/30
                  transition
                "
              >

                <div className="flex flex-col items-start">

                  {/* ICON */}
                  <div className="
                    w-12 h-12
                    flex items-center justify-center
                    rounded-lg
                    bg-yellow-400/10
                    text-yellow-400
                    mb-4
                  ">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* TITLE */}
                  <h3 className="text-white font-semibold text-lg mb-3">
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
        <div className="mt-20 text-center max-w-3xl mx-auto">

          <p className="text-gray-300 text-lg leading-relaxed">
            CAFLA is committed to developing referees through education,
            mentorship, fitness preparation, professionalism, and continuous
            improvement at every stage of officiating.
          </p>

        </div>

      </div>

    </section>
  )
}