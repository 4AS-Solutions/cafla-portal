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
        "We uphold fairness, honesty, and accountability in every decision, ensuring the game is officiated with respect and consistency."
    },
    {
      icon: Shield,
      title: "Discipline",
      description:
        "We maintain high standards of preparation, fitness, and professionalism, reflecting the commitment required at every level of the game."
    },
    {
      icon: TrendingUp,
      title: "Development",
      description:
        "We are committed to continuous growth through structured training, evaluation, and real match experience."
    },
    {
      icon: Users,
      title: "Community",
      description:
        "We foster a strong network of referees who support each other, creating an environment of collaboration and shared progress."
    },
    {
      icon: HeartHandshake,
      title: "Mentorship",
      description:
        "Experienced referees guide and support the next generation, helping them grow with confidence and knowledge."
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "We strive to reach the highest standards of officiating through consistency, performance, and dedication."
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
            Principles that define our referees
          </h2>

          <p className="mt-6 text-lg text-gray-300 md:text-xl">
            At CAFLA, refereeing goes beyond enforcing the Laws of the Game — 
            it is about developing individuals who represent discipline, integrity, and professionalism at every level.
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

                  <Icon className="h-6 w-6" />

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