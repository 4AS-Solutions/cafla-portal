"use client"

import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  ArrowRight,
  ExternalLink
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
            Interested in becoming a referee or learning more about CAFLA?
            Contact us and we’ll guide you through the process.
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

            <a
              href="https://maps.google.com/?q=5914+E+Washington+Blvd+Commerce+CA+90040"
              target="_blank"
              className="text-gray-400 text-sm hover:text-yellow-400 transition"
            >
              5914 E Washington Blvd
              <br />
              Commerce, CA 90040
            </a>
          </div>

          {/* EMAIL */}
          <div className="cafla-card p-8 rounded-3xl text-center">
            <div className="mb-6 inline-flex rounded-2xl bg-yellow-400/10 p-4 text-yellow-400">
              <Mail className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
              Email
            </h3>

            <a
              href="mailto:cafla1962@gmail.com"
              className="text-gray-400 text-sm hover:text-yellow-400 transition"
            >
              cafla1962@gmail.com
            </a>
          </div>

          {/* PHONE */}
          <div className="cafla-card p-8 rounded-3xl text-center">
            <div className="mb-6 inline-flex rounded-2xl bg-yellow-400/10 p-4 text-yellow-400">
              <Phone className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
              Phone
            </h3>

            <a
              href="tel:+13235550188"
              className="text-gray-400 text-sm hover:text-yellow-400 transition"
            >
              +1 (323) 555-0188
            </a>
          </div>

        </div>

        {/* SOCIAL */}
        <div className="mt-12 flex justify-center gap-6">
          <a
            href="https://www.facebook.com/Cafla1962"
            target="_blank"
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black transition hover:scale-110"
          >
            <Facebook size={18} />
          </a>

          <a
            href="https://www.instagram.com/caflareferees/"
            target="_blank"
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black transition hover:scale-110"
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
            Apply to Join CAFLA
            <ExternalLink size={18} />
          </Link>
        </div>

      </div>
    </section>
  )
}