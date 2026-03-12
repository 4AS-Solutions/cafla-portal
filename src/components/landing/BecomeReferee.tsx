"use client"

import { ArrowRight } from "lucide-react"

export function BecomeReferee() {

  return (
    <section
      id="join"
      className="relative py-32 cafla-section overflow-hidden"
    >

      <div className="max-w-6xl mx-auto px-6">

        {/* CTA CARD */}

        <div className="cafla-card rounded-3xl p-14 text-center relative overflow-hidden">

          {/* glow background */}

          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-400 blur-[160px] rounded-full"></div>
          </div>

          <div className="relative z-10">

            <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
              Start Your Referee Journey
            </h2>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
              Whether you're new to officiating or looking to grow your career
              as a referee, CAFLA provides education, mentorship, and a
              professional community to help you succeed.
            </p>

            {/* CTA button */}

            <a
              href="#contact"
              className="
              inline-flex items-center gap-3
              bg-gradient-to-r
              from-yellow-400
              to-yellow-500
              text-black
              font-semibold
              px-10
              py-4
              rounded-xl
              hover:scale-105
              transition
              duration-300
              shadow-xl
              shadow-yellow-500/25
              "
            >

              Become a Referee

              <ArrowRight size={20} />

            </a>

          </div>

        </div>

      </div>

    </section>
  )
}