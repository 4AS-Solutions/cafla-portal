"use client"

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

        {/* HEADER */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
            About CAFLA
          </p>

          <h2 className="text-4xl font-bold text-white md:text-6xl">
            More than six decades of refereeing excellence in Los Angeles
          </h2>

          <p className="mt-6 text-lg text-gray-300 md:text-xl">
            CAFLA has built a refereeing community based on education,
            discipline, mentorship, and continuous growth, preparing referees
            to lead with professionalism both on and off the field.
          </p>
        </div>

        {/* MAIN */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">

          {/* IMAGE */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-yellow-400/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
              <Image
                src="/images/barba-tamayo.jpg"
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

          {/* CONTENT */}
          <div className="space-y-6">

            {/* HISTORY */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400">
                  <History className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    History
                  </h3>
                  <p className="mt-3 text-gray-300">
                    Since 1962, CAFLA has developed generations of referees
                    committed to excellence, discipline, and continuous growth
                    within competitive soccer.
                  </p>
                </div>
              </div>
            </div>

            {/* MISSION + VISION */}
            <div className="grid gap-6 sm:grid-cols-2">

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="mb-4 inline-flex rounded-2xl bg-yellow-400/10 p-3 text-yellow-400">
                  <Target className="h-6 w-6" />
                </div>

                <h4 className="text-xl font-semibold text-white">
                  Mission
                </h4>

                <p className="mt-3 text-sm text-gray-300">
                  Develop referees through education, mentorship, and structured
                  evaluation within the soccer community.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="mb-4 inline-flex rounded-2xl bg-yellow-400/10 p-3 text-yellow-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <h4 className="text-xl font-semibold text-white">
                  Vision
                </h4>

                <p className="mt-3 text-sm text-gray-300">
                  To be a reference in referee development, combining tradition,
                  discipline, and professionalism in modern soccer.
                </p>
              </div>

            </div>

            {/* INNOVATION */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-yellow-400/10 to-emerald-500/10 p-6 backdrop-blur-md md:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400">
                  <TrendingUp className="h-6 w-6" />
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-white">
                    Tradition and Innovation
                  </h4>

                  <p className="mt-3 text-gray-300">
                    CAFLA combines decades of experience with a modern platform
                    that allows referees to track performance, evaluations, and
                    development over time.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}