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
            A structured pathway for referee development in Los Angeles
          </h2>

          <p className="mt-6 text-lg text-gray-300 md:text-xl">
            CAFLA is a non-profit referee organization established in 1962,
            dedicated to developing referees, instructors, and assessors through
            education, mentorship, and the proper application of the Laws of the Game.
          </p>
        </div>

        {/* MAIN */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">

          {/* IMAGE */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-yellow-400/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl h-full min-h-[500px] lg:min-h-[650px]">

              <Image
                src="/images/barba-tamayo.jpg"
                alt="Ricardo Barbas Tamayo"
                fill
                className="object-cover object-top"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="max-w-md rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-400">
                    Founded in 1962
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white leading-snug">
                    Ricardo Barbas Tamayo — Founder and pioneer of referee development in Los Angeles
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Built on decades of experience, mentorship, and professional standards
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
                    For over six decades, CAFLA has developed referees committed
                    to discipline, professionalism, and continuous growth, supporting
                    competitive soccer across Los Angeles and Southern California.
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
                  To prepare referees with the knowledge, discipline, and experience
                  required to officiate at all levels of the game through structured
                  training, evaluation, and mentorship.
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
                  To be a leading reference in referee development by combining
                  tradition, high standards, and a professional pathway for growth
                  within modern soccer.
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
                    Structured Development
                  </h4>

                  <p className="mt-3 text-gray-300">
                    CAFLA operates through a structured program that includes
                    weekly instruction, fitness training, game assignments, and
                    mentorship from experienced referees, providing a clear pathway
                    for long-term development and advancement.
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