import Image from "next/image"
import { History, Target, ShieldCheck, TrendingUp } from "lucide-react"

export function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-gradient-to-b from-black via-[#061312] to-[#081918] py-24 md:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_30%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.10),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
            About CAFLA
          </p>

          <h2 className="text-balance text-4xl font-bold tracking-tight text-white md:text-6xl">
            More than six decades of refereeing excellence in Los Angeles.
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-300 md:text-xl">
            CAFLA has built a refereeing community based on education,
            discipline, mentorship, and continuous growth, preparing referees
            to face the game with leadership and professionalism.
          </p>
        </div>

        {/* Main content */}
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image block */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-yellow-400/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
              <Image
                src="/images/referee-community.png"
                alt="CAFLA referees"
                width={1200}
                height={900}
                className="h-[320px] w-full object-cover md:h-[520px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="max-w-md rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-400">
                    Founded in 1962
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Refereeing tradition in Los Angeles and Southern California
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Story block */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400">
                  <History className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    History
                  </h3>
                  <p className="mt-3 leading-7 text-gray-300">
                    Since 1962, CAFLA has been a key organization in the
                    training and development of soccer referees. Over the years,
                    it has nurtured generations of officials committed to
                    excellence, continuous learning, and growth within
                    competitive refereeing.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
                  <Target className="h-6 w-6" />
                </div>

                <h4 className="text-xl font-semibold text-white">
                  Mission
                </h4>

                <p className="mt-3 text-sm leading-7 text-gray-300">
                  Develop referees through continuous education, mentorship,
                  evaluation, and real growth opportunities within the
                  soccer community.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="mb-4 inline-flex rounded-2xl bg-sky-500/10 p-3 text-sky-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <h4 className="text-xl font-semibold text-white">
                  Vision
                </h4>

                <p className="mt-3 text-sm leading-7 text-gray-300">
                  To be a reference in referee development, combining
                  tradition, discipline, technology, and professionalism within
                  the soccer community.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-600/15 to-yellow-400/10 p-6 backdrop-blur-md md:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white/10 p-3 text-yellow-400">
                  <TrendingUp className="h-6 w-6" />
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-white">
                    Tradition and Innovation
                  </h4>

                  <p className="mt-3 leading-7 text-gray-300">
                    CAFLA not only represents history; it also drives a new
                    era of referee development through its digital platform,
                    where referees can track their progress in attendance,
                    quizzes, evaluations, reports, and overall performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact bar */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
            <p className="text-4xl font-bold text-yellow-400 md:text-5xl">
              60+
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-gray-400">
              Years of History
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
            <p className="text-4xl font-bold text-yellow-400 md:text-5xl">
              500+
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-gray-400">
              Referees Developed
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
            <p className="text-4xl font-bold text-yellow-400 md:text-5xl">
              10,000+
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-gray-400">
              Matches Officiated
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}