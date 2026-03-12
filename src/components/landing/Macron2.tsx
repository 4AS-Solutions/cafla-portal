"use client"

import Image from "next/image"
import { Handshake, Shirt, Medal } from "lucide-react"

export function Macron2() {

  const items = [
    {
      icon: Handshake,
      title: "Strategic Alliance",
      text: "Our collaboration with Macron represents a commitment to professionalism and quality. As one of the leading sportswear brands in soccer, Macron provides our referees with high-performance uniforms that meet international standards.",
    },
    {
      icon: Shirt,
      title: "Professional Uniforms",
      text: "Every CAFLA referee is equipped with official Macron uniforms, ensuring a professional appearance on the field. Our kits include jerseys, shorts, socks, and accessories designed specifically for match officials.",
    },
    {
      icon: Medal,
      title: "Identity & Pride",
      text: "Wearing the CAFLA badge on Macron uniforms creates a strong sense of identity and belonging. Our referees represent excellence both in their performance and professional presentation.",
    },
  ]

  return (
    <section
      id="partnership"
      className="relative py-28 cafla-section overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-6">

        {/* header */}

        <div className="text-center mb-20">

          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
            Official Partnership
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Proud to partner with Macron as our official uniform provider.
          </p>

        </div>


        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT CARDS */}

          <div className="space-y-6">

            {items.map((item, i) => {

              const Icon = item.icon

              return (
                <div
                  key={i}
                  className="cafla-card p-8 rounded-xl border border-yellow-400/20 hover:scale-[1.02] transition"
                >

                  <div className="flex gap-6 items-start">

                    {/* BIGGER ICON */}

                    <div className="flex items-center justify-center w-14 h-14 rounded-lg">

                      <Icon
                        className="text-yellow-400"
                        size={30}
                        strokeWidth={2.5}
                      />

                    </div>

                    <div>

                      <h3 className="text-xl text-white font-semibold mb-2">
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


          {/* RIGHT CARD */}

          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl p-12 text-center shadow-xl">

            {/* MACRON LOGO */}

            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-6">

              <Image
                src="/images/macron.png"
                alt="Macron Logo"
                width={80}
                height={80}
                className="
                  object-contain
                  drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]
                  animate-[pulse_4s_ease-in-out_infinite]
                  hover:scale-110
                  transition
                  duration-500
                "
              />

            </div>


            <h3 className="text-3xl font-bold text-white mb-3">
              CAFLA × Macron
            </h3>

            <p className="text-white/90 mb-8">
              Official Uniform Partnership
            </p>


            <div className="space-y-4">

              <div className="bg-white/20 rounded-lg py-3 text-white font-semibold">
                Premium Quality Materials
              </div>

              <div className="bg-white/20 rounded-lg py-3 text-white font-semibold">
                Professional Design Standards
              </div>

              <div className="bg-white/20 rounded-lg py-3 text-white font-semibold">
                International Specifications
              </div>

            </div>


            <a
              href="https://clubshop.macron.com/macron_sportswear_us/cafla-referees"
              target="_blank"
              className="inline-block mt-8 bg-white text-black font-semibold px-8 py-3 rounded-lg hover:scale-105 transition"
            >
              Visit Official Store
            </a>

          </div>

        </div>

      </div>

    </section>
  )
}