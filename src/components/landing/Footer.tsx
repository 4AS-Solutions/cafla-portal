"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  ArrowRight,
  ExternalLink
} from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black pt-20 pb-10 border-t border-white/10">

      <div className="max-w-6xl mx-auto px-6">

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo/cafla-logo.png"
                alt="CAFLA"
                width={42}
                height={42}
              />
              <h3 className="text-yellow-400 font-heading text-xl">
                CAFLA
              </h3>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Colegio de Árbitros de Fútbol de Los Angeles. Developing referees through education, discipline, mentorship, 
              and the proper application of the Laws of the Game since 1962.
            </p>

            {/* SOCIAL */}
            <div className="flex gap-3 mt-6">
              <a
                href="https://www.facebook.com/Cafla1962"
                target="_blank"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black transition hover:scale-110"
              >
                <Facebook size={16} />
              </a>

              <a
                href="https://www.instagram.com/caflareferees/"
                target="_blank"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black transition hover:scale-110"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* NAVIGATION */}
          <div>
            <h4 className="text-yellow-400 font-semibold mb-4">
              Navigation
            </h4>

            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#home" className="hover:text-white">Home</a></li>
              <li><a href="#about" className="hover:text-white">About</a></li>
              <li><a href="#values" className="hover:text-white">Values</a></li>
              <li><a href="#calendar" className="hover:text-white">Calendar</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          {/* CONTACT + CTA */}
          <div>
            <h4 className="text-yellow-400 font-semibold mb-4">
              Contact
            </h4>

            <div className="space-y-3 text-gray-400 text-sm mb-6">

              <div className="flex items-start gap-2">
                <a
                  href="https://maps.google.com/?q=5914+E+Washington+Blvd+Commerce+CA+90040"
                  target="_blank"
                  className="flex items-start gap-2 hover:text-white transition"
                >
                  <MapPin size={16} className="mt-[2px] text-yellow-400" />
                  <span>
                    5914 E Washington Blvd
                    <br />
                    Commerce, CA 90040
                  </span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="mailto:cafla1962@gmail.com"
                  className="flex items-center gap-2 hover:text-white transition"
                >
                  <Mail size={16} className="text-yellow-400" />
                  cafla1962@gmail.com
                </a>
              </div>

            </div>

            {/* CTA */}
            <Link
              href="/join"
              className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-400 hover:text-white transition"
            >
              Apply to Become a CAFLA Referee
              <ExternalLink size={16} />
            </Link>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">

          <span>
            © 2026 CAFLA. All rights reserved.
            Los Angeles, California.
          </span>

          {/* CREDITS */}
          <div className="flex items-center gap-2 text-xs">
            <span>Built by</span>

            <a
              href="mailto:info@4assolutions.com"
              className="flex items-center gap-2 text-yellow-400 hover:text-white transition"
            >
              <Image
                src="/images/4as-white.png"
                alt="4AS Solutions"
                width={18}
                height={18}
              />
              4AS SOLUTIONS
            </a>
          </div>

        </div>

      </div>

    </footer>
  )
}