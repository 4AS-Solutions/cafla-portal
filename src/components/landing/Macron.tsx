"use client"

import Image from "next/image"

export function Macron() {

  const products = [
    {
      name: "Referee Jersey",
      image: "/logo/cafla-logo.png",
    },
    {
      name: "Referee Polo",
      image: "/logo/cafla-logo.png",
    },
    {
      name: "Training Jacket",
      image: "/logo/cafla-logo.png",
    },
    {
      name: "Referee Shorts",
      image: "/logo/cafla-logo.png",
    },
  ]

  return (
    <section
      id="macron"
      className="relative py-28 cafla-section overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-6">

        {/* header */}

        <div className="text-center mb-20">

          <p className="text-yellow-400 text-sm tracking-wider uppercase mb-3">
            Official Equipment Partner
          </p>

          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
            CAFLA × Macron
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            CAFLA referees wear official equipment provided by Macron,
            ensuring professional appearance, performance, and comfort
            on and off the field.
          </p>

        </div>


        {/* products */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">

          {products.map((product, i) => (

            <div
              key={i}
              className="cafla-card p-8 rounded-xl hover:scale-[1.04] transition-all duration-300 text-center"
            >

              <div className="relative w-full h-48 mb-6">

                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain"
                />

              </div>

              <h3 className="text-white font-semibold">
                {product.name}
              </h3>

            </div>

          ))}

        </div>


        {/* CTA */}

        <div className="text-center">

          <a
            href="https://clubshop.macron.com/macron_sportswear_us/cafla-referees"
            target="_blank"
            className="bg-yellow-400 text-black font-semibold px-10 py-4 rounded-lg hover:scale-105 transition"
          >
            Visit Official Macron Store
          </a>

        </div>

      </div>

    </section>
  )
}