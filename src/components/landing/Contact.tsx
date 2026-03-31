"use client"

import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export function Contact() {
  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 cafla-section overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
            Contact
          </p>

          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
            Get in touch with CAFLA
          </h2>

          <p className="text-gray-400 text-lg">
            Have questions about joining or want to learn more about our
            organization? Reach out and we’ll guide you through the next steps.
          </p>
        </div>

        {/* CONTACT GRID */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {/* LOCATION */}
          <div className="cafla-card p-8 rounded-3xl text-center">
            <div className="mb-6 inline-flex rounded-2xl bg-yellow-400/10 p-4 text-yellow-400">
              <MapPin className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
              Location
            </h3>

            <p className="text-gray-400 text-sm">
              5914 E Washington Blvd
              <br />
              Commerce, CA 90040
            </p>
          </div>

          {/* EMAIL */}
          <div className="cafla-card p-8 rounded-3xl text-center">
            <div className="mb-6 inline-flex rounded-2xl bg-yellow-400/10 p-4 text-yellow-400">
              <Mail className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
              Email
            </h3>

            <p className="text-gray-400 text-sm">
              info@cafla.org
              <br />
              membership@cafla.org
            </p>
          </div>

          {/* PHONE */}
          <div className="cafla-card p-8 rounded-3xl text-center">
            <div className="mb-6 inline-flex rounded-2xl bg-yellow-400/10 p-4 text-yellow-400">
              <Phone className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
              Phone
            </h3>

            <p className="text-gray-400 text-sm">
              +1 (323) 555-0188
            </p>
          </div>

        </div>

        {/* SOCIAL */}
        <div className="mt-12 flex justify-center gap-6">
          <a
            href="#"
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black transition"
          >
            <Facebook size={18} />
          </a>

          <a
            href="#"
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black transition"
          >
            <Instagram size={18} />
          </a>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/join"
            className="
              inline-flex items-center gap-3
              bg-gradient-to-r from-yellow-400 to-yellow-500
              text-black font-semibold
              px-8 py-4 rounded-xl
              hover:scale-105 transition duration-300
              shadow-xl shadow-yellow-500/25
            "
          >
            Join CAFLA
            <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </section>
  )
}