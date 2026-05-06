"use client"

import {
  Users,
  ClipboardList,
  Activity,
  Eye,
} from "lucide-react"

export function FirstSessionOverview() {

  const items = [
    {
      icon: Users,
      title: "Introduction to CAFLA",
      text: "Learn about CAFLA’s referee development structure, instructional environment, and organizational standards.",
    },
    {
      icon: ClipboardList,
      title: "Referee Development Path",
      text: "Understand how training, mentorship, match assignments, evaluations, and referee progression work within CAFLA.",
    },
    {
      icon: Activity,
      title: "Training & Expectations",
      text: "Learn about attendance expectations, professionalism, fitness preparation, reporting responsibilities, and participation standards.",
    },
    {
      icon: Eye,
      title: "Observe a Live Session",
      text: "Attend a real CAFLA instructional session and experience how referee training and development are conducted.",
    },
  ]

  return (
    <section className="relative py-24 cafla-section overflow-hidden">

      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16 max-w-3xl mx-auto">

          <p className="text-sm uppercase tracking-[0.25em] text-yellow-400 mb-4">
            Your First Visit
          </p>

          <h2 className="text-3xl md:text-4xl text-white font-semibold mb-6">
            What To Expect During Your First Session
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed">
            Your first session introduces the structure, expectations, and
            development process behind referee training at CAFLA.
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
        <div className="mt-16 text-center max-w-2xl mx-auto">

          <p className="text-gray-400 text-sm leading-relaxed">
            Attending a session is the first step in understanding the
            commitment, training environment, and development opportunities
            available through CAFLA.
          </p>

        </div>

      </div>

    </section>
  )
}