"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Inicio", href: "#home" },
    { name: "Conoce CAFLA", href: "#about" },
    { name: "Valores", href: "#values" },
    { name: "Plan de Desarrollo", href: "#development" },
    { name: "Calendario", href: "#calendario" },
    { name: "Links", href: "#links" },
    { name: "Contacto", href: "#contacto" },
  ]

  const handleNav = (href: string) => {
    setOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-500
        ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div
            className={`flex items-center justify-between transition-all duration-300
            ${scrolled ? "h-16" : "h-20"}`}
          >

            {/* Logo */}
            <div className="flex items-center gap-4">

              <Image
                src="/logo/cafla-logo.png"
                alt="CAFLA"
                width={scrolled ? 36 : 42}
                height={scrolled ? 36 : 42}
                className="rounded-full transition-all duration-300"
              />

              <div className="hidden sm:block leading-tight">

                <p
                  className={`font-heading text-yellow-400 transition-all
                  ${scrolled ? "text-base" : "text-lg"}`}
                >
                  CAFLA
                </p>

              </div>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-10">

              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNav(item.href)}
                  className="relative text-sm text-gray-300 hover:text-yellow-400 transition"
                >
                  {item.name}

                  {/* hover underline */}
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}

            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden text-white"
            >
              <Menu size={26} />
            </button>

          </div>
        </div>
      </nav>

      {/* ================= */}
      {/* MOBILE SIDEBAR */}
      {/* ================= */}

      {open && (
        <div className="fixed inset-0 z-50">

          {/* background blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          {/* sidebar */}
          <div className="absolute right-0 top-0 h-full w-[75%] max-w-sm bg-[#0B0F0F] border-r border-white/10 shadow-2xl p-8 flex flex-col animate-slideInLeft">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-10">

              <div className="flex items-center gap-3">

                <Image
                  src="/logo/cafla-logo.png"
                  alt="CAFLA"
                  width={36}
                  height={36}
                />

                <span className="font-heading text-yellow-400 text-lg">
                  CAFLA
                </span>

              </div>

              <button onClick={() => setOpen(false)}>
                <X className="text-white" />
              </button>

            </div>


            {/* NAVIGATION */}
            <div className="flex flex-col gap-6">

              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNav(item.href)}
                  className="sidebar-link text-left text-lg text-gray-300 hover:text-yellow-400 transition"
                >
                  {item.name}
                </button>
              ))}

            </div>


            {/* FOOTER CTA */}
            <div className="mt-auto pt-10 border-t border-white/10">

              {/* Become referee */}
              <button
                onClick={() => handleNav("#contacto")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Become a Referee
              </button>

              {/* Member login */}
              <button
                className="w-full mt-4 border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold py-3 rounded-lg transition"
              >
                Member Login
              </button>

              {/* Social icons */}
              <div className="flex justify-center gap-6 mt-6 text-gray-400">

                <a href="#" className="hover:text-yellow-400 transition">
                  Instagram
                </a>

                <a href="#" className="hover:text-yellow-400 transition">
                  Facebook
                </a>

                <a href="#" className="hover:text-yellow-400 transition">
                  Twitter
                </a>

              </div>

            </div>

          </div>
        </div>
      )}
    </>
  )
}