"use client"

import Image from "next/image"
import { CheckCircle, BarChart3 } from "lucide-react"

export function AnalyticsDashboard() {

  const features = [
    "Match performance tracking",
    "Peer evaluation insights",
    "Referee ranking system",
    "Meeting attendance monitoring",
    "Knowledge exam analytics",
  ]

  return (
    <section className="relative py-28 cafla-section overflow-hidden">

      <div className="max-w-7xl mx-auto px-6">

        {/* header */}

        <div className="text-center mb-20">

          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
            Advanced Referee Analytics
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Powerful analytics and insights designed to help referees
            track their performance and development throughout the season.
          </p>

        </div>


        {/* content */}

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* left content */}

          <div>

            <h3 className="text-2xl text-white font-semibold mb-8">
              Data-Driven Referee Development
            </h3>

            <div className="space-y-4 mb-10">

              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <CheckCircle
                    size={20}
                    className="text-emerald-400"
                  />

                  <span>{feature}</span>
                </div>
              ))}

            </div>


            <button className="bg-yellow-400 text-black font-semibold px-8 py-3 rounded-lg hover:scale-105 transition">

              View Platform

            </button>

          </div>


          {/* dashboard preview */}

          <div className="relative">

            <div className="cafla-card rounded-2xl p-4">

              <Image
                src="/images/dashboard-preview.png"
                alt="CAFLA Referee Dashboard"
                width={1200}
                height={800}
                className="rounded-xl"
              />

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}