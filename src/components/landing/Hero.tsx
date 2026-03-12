"use client"

import { Award, CalendarDays, Globe, Users } from "lucide-react"
import Image from "next/image"

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden"
      style={{
        backgroundImage: "url('/images/soccer_ground.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* dark cinematic overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* gradient lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black"></div>


      {/* content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">

        {/* logo */}
        <div className="flex justify-center mb-8 hero-reveal hero-delay-1">

          <Image
            src="/logo/cafla-logo.png"
            alt="CAFLA"
            width={120}
            height={120}
            className="drop-shadow-2xl"
          />

        </div>


        {/* title */}
        <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight hero-reveal hero-delay-2">
          CAFLA
        </h1>


        {/* subtitle */}
        <p className="text-xl md:text-2xl text-yellow-400 font-medium mb-4 hero-reveal hero-delay-3">
          Colegio de Arbitros de Futbol de Los Angeles
        </p>


        <p className="text-gray-300 max-w-2xl mx-auto mb-12 text-lg hero-reveal hero-delay-3">
          Developing elite referees since 1962 through education,
          mentorship, and a modern performance development platform.
        </p>


        {/* buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 hero-reveal hero-delay-4">

          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-lg transition transform hover:scale-105">
            Become a Referee
          </button>

          <button className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold px-8 py-4 rounded-lg transition transform hover:scale-105">
            Member Login
          </button>

        </div>


        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">

          <div className="group bg-white/5 backdrop-blur-lg border border-yellow-400/20 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300">

            <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition" />

            <p className="text-2xl font-bold text-white">60+</p>
            <p className="text-sm text-gray-300">Years of Excellence</p>

          </div>

          <div className="group bg-white/5 backdrop-blur-lg border border-yellow-400/20 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300">

            <Users className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition" />

            <p className="text-2xl font-bold text-white">500+</p>
            <p className="text-sm text-gray-300">Certified Referees</p>

          </div>

          <div className="group bg-white/5 backdrop-blur-lg border border-yellow-400/20 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300">

            <CalendarDays className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition" />

            <p className="text-2xl font-bold text-white">10,000+</p>
            <p className="text-sm text-gray-300">Matches Officiated</p>

          </div>

          <div className="group bg-white/5 backdrop-blur-lg border border-yellow-400/20 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300">

            <Globe className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition" />

            <p className="text-2xl font-bold text-white">5+</p>
            <p className="text-sm text-gray-300">Countries Officiated</p>

          </div>

        </div>

      </div>

    </section>
  )
}