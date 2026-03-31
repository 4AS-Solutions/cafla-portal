"use client"

import { DollarSign, Scale, Users, Shield } from "lucide-react"

export function ImportantInfo() {

  const items = [
    {
      icon: DollarSign,
      title: "Membership & Fees",
      text: "CAFLA requires an annual membership fee of $90. Referees also contribute a 10% fee from adult match assignments to support operations, training, and development programs.",
    },
    {
      icon: Scale,
      title: "Commitment & Standards",
      text: "Members are expected to attend training sessions regularly, follow CAFLA guidelines, and maintain professionalism both on and off the field.",
    },
    {
      icon: Users,
      title: "Active Participation",
      text: "Being part of CAFLA means being involved. Members are encouraged to participate in training sessions, meetings, and community activities.",
    },
    {
      icon: Shield,
      title: "Code of Conduct",
      text: "All referees must respect players, coaches, and fellow officials. Discipline, punctuality, and integrity are fundamental values within CAFLA.",
    },
  ]

  return (
    <section className="relative py-24 cafla-section overflow-hidden">

      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16 max-w-2xl mx-auto">

          <p className="text-sm uppercase tracking-[0.25em] text-yellow-400 mb-4">
            Important Information
          </p>

          <h2 className="text-3xl md:text-4xl text-white font-semibold mb-6">
            What You Should Know Before Joining
          </h2>

          <p className="text-gray-400 text-lg">
            Before attending your first session, it’s important to understand
            the expectations, structure, and responsibilities involved in being part of CAFLA.
          </p>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-8">

          {items.map((item, i) => {
            const Icon = item.icon

            return (
              <div
                key={i}
                className="cafla-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-yellow-400/30 transition"
              >

                <div className="flex gap-4 items-start">

                  {/* ICON */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* CONTENT */}
                  <div>

                    <h3 className="text-white font-semibold text-lg mb-2">
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

        {/* NOTE */}
        <div className="mt-16 text-center max-w-xl mx-auto">

          <p className="text-gray-400 text-sm">
            Our goal is to build committed referees who are serious about their
            development and contribution to the game.
          </p>

        </div>

      </div>

    </section>
  )
}