"use client"

import Image from "next/image"
import { Handshake, Shirt, Medal } from "lucide-react"

export function Macron2() {

  const items = [
    {
      icon: Handshake,
      title: "Professional Standards",
      text: "CAFLA operates under structured standards that ensure consistency, discipline, and professionalism across all referees and competitions.",
    },
    {
      icon: Shirt,
      title: "Certified Equipment",
      text: "Referees are equipped with professional-grade uniforms designed for performance, comfort, and compliance with official match requirements.",
    },
    {
      icon: Medal,
      title: "Identity & Representation",
      text: "Every referee represents CAFLA with consistency and pride, maintaining a professional image both on and off the field.",
    },
  ]

  return (
    <section
      id="partnership"
      className="relative py-24 md:py-32 cafla-section overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16 max-w-2xl mx-auto">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
            Standards
          </p>

          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
            Professional Standards & Equipment
          </h2>

          <p className="text-gray-400 text-lg">
            CAFLA referees operate under professional standards using certified
            equipment designed for performance, consistency, and identity on the field.
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <div className="space-y-6">
            {items.map((item, i) => {
              const Icon = item.icon

              return (
                <div
                  key={i}
                  className="cafla-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-yellow-400/30 transition"
                >
                  <div className="flex gap-4 items-start">

                    {/* ICON FIXED */}
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* TEXT */}
                    <div>
                      <h3 className="text-lg text-white font-semibold mb-2">
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

          {/* RIGHT */}
          <div className="cafla-card p-10 rounded-3xl text-center border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-md">

            {/* LOGO */}
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6">
              <Image
                src="/images/macron.png"
                alt="Macron Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>

            <h3 className="text-2xl font-semibold text-white mb-2">
              Official Equipment Partner
            </h3>

            <p className="text-gray-400 mb-8 text-sm">
              CAFLA collaborates with Macron to ensure referees meet
              international standards in performance and presentation.
            </p>

            <div className="space-y-3 mb-8">

              <div className="bg-white/5 rounded-lg py-2 text-gray-300 text-sm">
                Performance-Grade Materials
              </div>

              <div className="bg-white/5 rounded-lg py-2 text-gray-300 text-sm">
                Professional Design Standards
              </div>

              <div className="bg-white/5 rounded-lg py-2 text-gray-300 text-sm">
                International Match Compliance
              </div>

            </div>

            <a
              href="https://clubshop.macron.com/macron_sportswear_us/cafla-referees"
              target="_blank"
              className="inline-block text-sm font-semibold text-yellow-400 hover:text-white transition"
            >
              View Equipment Details
            </a>

          </div>

        </div>

      </div>
    </section>
  )
}