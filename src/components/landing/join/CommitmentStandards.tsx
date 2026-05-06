"use client"

import {
  DollarSign,
  Shield,
  Activity,
  TrendingUp,
} from "lucide-react"

export function CommitmentStandards() {

  const items = [
    {
      icon: DollarSign,
      title: "Membership & Contributions",
      text: "CAFLA requires a $90 annual membership fee. Referees also contribute 10% from adult match assignments, which helps support facility operations, instructor development, referee training, technology infrastructure, and long-term organizational growth.",
    },
    {
      icon: Activity,
      title: "Commitment to Development",
      text: "CAFLA looks for referees who are willing to learn, train consistently, attend instructional sessions, and actively participate in their own development both on and off the field.",
    },
    {
      icon: Shield,
      title: "Professional Standards",
      text: "Members are expected to demonstrate professionalism, discipline, punctuality, integrity, and respect toward players, coaches, fellow referees, and the game itself.",
    },
    {
      icon: TrendingUp,
      title: "Continuous Improvement",
      text: "CAFLA is focused on long-term referee growth through mentorship, education, fitness preparation, accountability, and continuous improvement at every level of officiating.",
    },
  ]

  return (
    <section className="relative py-24 cafla-section overflow-hidden">

      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16 max-w-3xl mx-auto">

          <p className="text-sm uppercase tracking-[0.25em] text-yellow-400 mb-4">
            Commitment & Standards
          </p>

          <h2 className="text-3xl md:text-4xl text-white font-semibold mb-6">
            What CAFLA Expects From Its Members
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed">
            CAFLA is built around referee development, professionalism,
            continuous improvement, and long-term growth within the game.
          </p>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-8">

          {items.map((item, i) => {

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

                <div className="flex gap-4 items-start">

                  {/* ICON */}
                  <div className="
                    w-12 h-12
                    flex items-center justify-center
                    rounded-lg
                    bg-yellow-400/10
                    text-yellow-400
                    shrink-0
                  ">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* CONTENT */}
                  <div>

                    <h3 className="text-white font-semibold text-lg mb-3">
                      {item.title}
                    </h3>

                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.text}
                    </p>

                  </div>

                </div>

              </div>

            )

          })}

        </div>

        {/* BOTTOM NOTE */}
        <div className="mt-16 text-center max-w-3xl mx-auto">

          <p className="text-gray-400 text-sm leading-relaxed">
            CAFLA is not built around simply assigning large numbers of matches.
            The organization is focused on developing referees who are committed
            to learning, improving, and advancing through discipline,
            education, fitness preparation, and continuous development.
          </p>

        </div>

      </div>

    </section>
  )
}