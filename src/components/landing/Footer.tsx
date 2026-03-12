"use client"

import Image from "next/image"
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone
} from "lucide-react"

export function Footer() {

  return (

    <footer className="bg-black pt-16 pb-8">

      <div className="max-w-7xl mx-auto px-6">

        {/* MAIN GRID */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* BRAND */}

          <div>

            <div className="flex items-center gap-3 mb-4">

              <Image
                src="/logo/cafla-logo.png"
                alt="CAFLA"
                width={45}
                height={45}
              />

              <h3 className="text-yellow-400 font-heading text-xl">
                CAFLA
              </h3>

            </div>

            <p className="text-gray-400 text-sm leading-relaxed">

              Colegio de Arbitros de de Futbol de Los Angeles. <br/>
              Developing elite referees since 1962.

            </p>

            {/* SOCIAL */}

            <div className="flex gap-3 mt-5">

              <a className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center hover:bg-emerald-600 transition">
                <Facebook size={16}/>
              </a>

              <a className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center hover:bg-emerald-600 transition">
                <Instagram size={16}/>
              </a>

              <a className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center hover:bg-emerald-600 transition">
                <Twitter size={16}/>
              </a>

            </div>

          </div>


          {/* QUICK LINKS */}

          <div>

            <h4 className="text-yellow-400 font-semibold mb-4">
              Quick Links
            </h4>

            <ul className="space-y-2 text-gray-400 text-sm">

              <li><a href="#about" className="hover:text-white">About CAFLA</a></li>
              <li><a href="#values" className="hover:text-white">Our Values</a></li>
              <li><a href="#development" className="hover:text-white">Development Platform</a></li>
              <li><a href="#calendar" className="hover:text-white">Calendar</a></li>

            </ul>

          </div>


          {/* RESOURCES */}

          <div>

            <h4 className="text-yellow-400 font-semibold mb-4">
              Resources
            </h4>

            <ul className="space-y-2 text-gray-400 text-sm">

              <li><a href="#">US Soccer</a></li>
              <li><a href="#">Cal South</a></li>
              <li><a href="#">Laws of the Game</a></li>
              <li><a href="#">Member Portal</a></li>

            </ul>

          </div>


          {/* CONTACT */}

          <div>

            <h4 className="text-yellow-400 font-semibold mb-4">
              Contact
            </h4>

            <div className="space-y-3 text-gray-400 text-sm">

              <div className="flex items-start gap-2">

                <MapPin size={16} className="mt-[2px]" />

                <span>
                  Los Angeles, CA<br/>
                  Southern California
                </span>

              </div>

              <div className="flex items-center gap-2">

                <Mail size={16}/>
                info@cafla.org

              </div>

              <div className="flex items-center gap-2">

                <Phone size={16}/>
                Contact via form

              </div>

            </div>

          </div>

        </div>


        {/* DIVIDER */}

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between text-gray-500 text-sm">

          <span>
            © 2026 CAFLA - College of Referees of Los Angeles. All rights reserved.
          </span>

          <div className="flex gap-6 mt-4 md:mt-0">

            <a className="hover:text-white">Privacy Policy</a>
            <a className="hover:text-white">Terms of Use</a>

          </div>

        </div>

      </div>

    </footer>

  )

}