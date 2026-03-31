"use client"

import { Users, ClipboardList, MessageCircle, Activity } from "lucide-react"

export function NextSession() {

  const items = [
    {
      icon: Users,
      title: "Meet the Team",
      text: "Get to know CAFLA members, instructors, and fellow referees in a welcoming environment.",
    },
    {
      icon: ClipboardList,
      title: "Program Overview",
      text: "We will explain how the referee program works, including training, match assignments, and development.",
    },
    {
      icon: MessageCircle,
      title: "Ask Questions",
      text: "You will have the opportunity to ask questions and understand what to expect before joining.",
    },
    {
      icon: Activity,
      title: "Optional Participation",
      text: "You may observe or optionally participate in parts of the session — no pressure.",
    },
  ]

  return (
    <section className="relative py-24 cafla-section overflow-hidden">

      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16 max-w-2xl mx-auto">

          <p className="text-sm uppercase tracking-[0.25em] text-yellow-400 mb-4">
            Your First Visit
          </p>

          <h2 className="text-3xl md:text-4xl text-white font-semibold mb-6">
            What Happens When You Attend
          </h2>

          <p className="text-gray-400 text-lg">
            Your first session is designed to help you understand how CAFLA works,
            meet the community, and decide if this path is right for you.
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

        {/* BOTTOM NOTE */}
        <div className="mt-16 text-center max-w-xl mx-auto">

          <p className="text-gray-400 text-sm">
            You are not required to commit immediately. This session is an opportunity
            to learn more and decide if becoming a referee is right for you.
          </p>

        </div>

      </div>

    </section>
  )
}