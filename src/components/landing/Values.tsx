import {
  HeartHandshake,
  Users,
  TrendingUp,
  Scale,
  Award,
  Shield
} from "lucide-react"

export function Values() {
  const values = [
    {
      icon: Scale,
      title: "Integrity",
      description:
        "We act with honesty and transparency in every decision, maintaining the highest ethical standards on and off the field."
    },
    {
      icon: HeartHandshake,
      title: "Respect",
      description:
        "We treat players, coaches, and fans with respect, promoting fair play and sportsmanship in every match we officiate."
    },
    {
      icon: Shield,
      title: "Discipline",
      description:
        "We maintain rigorous standards of preparation, punctuality, and professionalism, embodying the discipline required of elite officials."
    },
    {
      icon: Users,
      title: "Teamwork",
      description:
        "We collaborate as a community, supporting each other through peer evaluations, mentorship, and shared experiences."
    },
    {
      icon: TrendingUp,
      title: "Continuous Development",
      description:
        "We are committed to constant learning, staying updated with the latest rules and techniques to improve our craft."
    },    
    {
      icon: Award,
      title: "Professionalism",
      description:
        "We strive for excellence in every aspect of our work, representing CAFLA with pride and maintaining the highest standards."
    }
  ]

  return (
    <section
      id="values"
      className="relative overflow-hidden bg-[#050b0a] py-24 md:py-32"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_30%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-6">

        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
            Values
          </p>

          <h2 className="text-4xl font-bold text-white md:text-6xl">
            Principles that guide our refereeing
          </h2>

          <p className="mt-6 text-lg text-gray-300 md:text-xl">
            At CAFLA, we believe that refereeing is not just about enforcing the
            rules of the game, but about embodying values that strengthen the
            spirit of soccer.
          </p>

        </div>

        {/* Values Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {values.map((value, index) => {
            const Icon = value.icon

            return (
              <div
                key={index}
                className="group relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition duration-300 hover:border-yellow-400/30 hover:bg-white/10"
              >

                {/* Icon */}
                <div className="mb-6 inline-flex rounded-2xl bg-yellow-400/10 p-4 text-yellow-400 group-hover:scale-110 transition">

                  <Icon className="h-7 w-7" />

                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white">
                  {value.title}
                </h3>

                {/* Description */}
                <p className="mt-4 leading-7 text-gray-300">
                  {value.description}
                </p>

              </div>
            )
          })}

        </div>

        {/* Bottom Quote Block */}
        <div className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-r from-yellow-400/10 via-emerald-500/10 to-yellow-400/10 p-10 text-center backdrop-blur-md">

          <p className="text-lg text-gray-300 md:text-xl">
            “Refereeing not only protects the game, it also protects its values.”
          </p>

          <p className="mt-4 font-semibold text-yellow-400">
            CAFLA Community
          </p>

        </div>

      </div>
    </section>
  )
}