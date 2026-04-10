"use client"

import { Award, CalendarDays, Globe, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-28 pb-16"
      style={{
        backgroundImage: "url('/images/soccer_ground.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <div className="hero-reveal hero-delay-1 mb-8 flex justify-center">
          <Image
            src="/logo/cafla-logo.png"
            alt="CAFLA"
            width={120}
            height={120}
            className="drop-shadow-2xl"
          />
        </div>

        <p className="hero-reveal hero-delay-2 mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-yellow-400">
          Since 1962
        </p>

        <h1 className="hero-reveal hero-delay-2 mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
          Professional Referee Development in Los Angeles
        </h1>

        <p className="hero-reveal hero-delay-3 mb-4 text-lg font-medium text-yellow-400 md:text-2xl">
          Colegio de Arbitros de Futbol de Los Angeles
        </p>

        <p className="hero-reveal hero-delay-3 mx-auto mb-12 max-w-3xl text-lg text-gray-300 md:text-xl">
          CAFLA develops referees through education, mentorship, structured
          evaluation, and a professional environment built to support long-term
          growth on and off the field.
        </p>

        <div className="hero-reveal hero-delay-4 mb-16 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/join"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-8 py-4 font-semibold text-white active:scale-95 transition hover:scale-105 hover:bg-emerald-700"
          >
            Join CAFLA
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-yellow-400 px-8 py-4 font-semibold text-yellow-400 transition hover:scale-105 hover:bg-yellow-400 hover:text-black"
          >
            Member Login
          </Link>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          <div className="group rounded-xl border border-yellow-400/20 bg-white/5 p-6 text-center backdrop-blur-lg transition-all duration-300 hover:bg-white/10">
            <Award className="mx-auto mb-3 h-8 w-8 text-yellow-400 transition group-hover:scale-110" />
            <p className="text-2xl font-bold text-white">60+</p>
            <p className="text-sm text-gray-300">Years of Excellence</p>
          </div>

          <div className="group rounded-xl border border-yellow-400/20 bg-white/5 p-6 text-center backdrop-blur-lg transition-all duration-300 hover:bg-white/10">
            <Users className="mx-auto mb-3 h-8 w-8 text-yellow-400 transition group-hover:scale-110" />
            <p className="text-2xl font-bold text-white">500+</p>
            <p className="text-sm text-gray-300">Certified Referees</p>
          </div>

          <div className="group rounded-xl border border-yellow-400/20 bg-white/5 p-6 text-center backdrop-blur-lg transition-all duration-300 hover:bg-white/10">
            <CalendarDays className="mx-auto mb-3 h-8 w-8 text-yellow-400 transition group-hover:scale-110" />
            <p className="text-2xl font-bold text-white">10,000+</p>
            <p className="text-sm text-gray-300">Matches Officiated</p>
          </div>

          <div className="group rounded-xl border border-yellow-400/20 bg-white/5 p-6 text-center backdrop-blur-lg transition-all duration-300 hover:bg-white/10">
            <Globe className="mx-auto mb-3 h-8 w-8 text-yellow-400 transition group-hover:scale-110" />
            <p className="text-2xl font-bold text-white">5+</p>
            <p className="text-sm text-gray-300">Countries Officiated</p>
          </div>
        </div>
      </div>
    </section>
  )
}