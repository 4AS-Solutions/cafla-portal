"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X, ArrowRight } from "lucide-react"

const navLinks = [
  { name: "Home", id: "home" },
  { name: "About CAFLA", id: "about" },
  { name: "Values", id: "values" },
  { name: "Development Plan", id: "development" },
  { name: "Calendar", id: "calendar" },
  { name: "Links", id: "resources" },
  { name: "Macron", id: "partnership" },
  { name: "Become CAFLA", id: "join" },
  { name: "Board", id: "board" },
  { name: "Contact", id: "contact" }
]

export function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {

    const handleScroll = () => {

      setScrolled(window.scrollY > 40)

      navLinks.forEach(link => {

        const el = document.getElementById(link.id)

        if (!el) return

        const rect = el.getBoundingClientRect()

        if (rect.top <= 120 && rect.bottom >= 120) {
          setActiveSection(link.id)
        }

      })

    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)

  }, [])

  const scrollToSection = (id: string) => {

    const el = document.getElementById(id)

    if (!el) return

    el.scrollIntoView({
      behavior: "smooth"
    })

    setMenuOpen(false)
  }

  return (
    <>
      {/* NAVBAR */}

      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/80 backdrop-blur border-b border-white/10 h-16"
            : "bg-transparent h-20"
        }`}
      >

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <Link href="#" className="flex items-center gap-3" onClick={() => scrollToSection("home")}>
              <Image
                src="/logo/cafla-logo.png"
                alt="CAFLA"
                width={scrolled ? 30 : 36}
                height={scrolled ? 30 : 36}
                className="transition-all duration-300"
              />
            </Link>

            <span className="text-yellow-400 font-semibold text-lg">
              CAFLA
            </span>

          </div>

          {/* DESKTOP MENU */}

          <nav className="hidden xl:flex items-center gap-8 text-sm">

            {navLinks.map(link => (

              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="relative text-gray-300 hover:text-white transition"
              >

                {link.name}

                <span
                  className={`absolute -bottom-2 left-0 h-[2px] bg-yellow-400 transition-all duration-300 ${
                    activeSection === link.id
                      ? "w-full opacity-100"
                      : "w-0 opacity-0"
                  }`}
                />

              </button>

            ))}

          </nav>

          {/* MOBILE BUTTON */}

          <button
            className="xl:hidden text-white"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={28} />
          </button>

        </div>

      </header>

      {/* MOBILE SIDEBAR */}

      {menuOpen && (

        <div className="fixed inset-0 z-50 flex">

          {/* OVERLAY */}

          <div
            className="flex-1 bg-black/70"
            onClick={() => setMenuOpen(false)}
          />

          {/* SIDEBAR */}

          <div className="w-[300px] bg-[#020B0A] border-r border-white/10 flex flex-col">

            {/* HEADER */}

            <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">

              <div className="flex items-center gap-3">

                <Image
                  src="/logo/cafla-logo.png"
                  alt="CAFLA"
                  width={34}
                  height={34}
                />

                <span className="text-yellow-400 font-semibold">
                  CAFLA
                </span>

              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={26} />
              </button>

            </div>

            {/* LINKS */}

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

              {navLinks.map(link => (

                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="block text-lg text-left w-full text-gray-300 hover:text-white transition"
                >
                  {link.name}
                </button>

              ))}

            </div>

            {/* ACTION BUTTONS */}

            <div className="p-6 border-t border-white/10 space-y-4">

              <button
                onClick={() => scrollToSection("join")}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                Become a Referee
                <ArrowRight size={18} />
              </button>

              <Link
                href="/portal"
                className="block text-center w-full border border-yellow-400 text-yellow-400 py-3 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black transition"
              >
                Member Login
              </Link>

            </div>

          </div>

        </div>

      )}

    </>
  )
}