"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

const landingNavLinks = [
  { name: "Home", id: "home" },
  { name: "About", id: "about" },
  { name: "Values", id: "values" },
  { name: "Calendar", id: "calendar" },
  { name: "Partnership", id: "partnership" },
  { name: "Contact", id: "contact" },
]

const internalNavLinks = [
  { name: "Home", href: "/" },
  { name: "Join", href: "/join" },
]

export function Navbar() {
  const pathname = usePathname()

  const isHomePage = pathname === "/"
  const isJoinPage = pathname === "/join"

  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [scrolled, setScrolled] = useState(false)

  const navLinks = useMemo(() => {
    return isHomePage ? landingNavLinks : []
  }, [isHomePage])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)

      if (!isHomePage) return

      for (const link of landingNavLinks) {
        const el = document.getElementById(link.id)
        if (!el) continue

        const rect = el.getBoundingClientRect()

        if (rect.top <= 120 && rect.bottom >= 120) {
          setActiveSection(link.id)
          break
        }
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const scrollToSection = (id: string) => {
    if (!isHomePage) return

    const el = document.getElementById(id)
    if (!el) return

    el.scrollIntoView({ behavior: "smooth" })
    setMenuOpen(false)
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header
        className={`fixed inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl"
            : "h-20 bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {isHomePage ? (
              <Link
                href="#"
                className="flex items-center gap-3"
                onClick={() => scrollToSection("home")}
              >
                <Image
                  src="/logo/cafla-logo.png"
                  alt="CAFLA"
                  width={scrolled ? 30 : 36}
                  height={scrolled ? 30 : 36}
                  className="transition-all duration-300"
                />
                <span className="text-lg font-semibold text-yellow-400">
                  CAFLA
                </span>
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logo/cafla-logo.png"
                  alt="CAFLA"
                  width={scrolled ? 30 : 36}
                  height={scrolled ? 30 : 36}
                  className="transition-all duration-300"
                />
                <span className="text-lg font-semibold text-yellow-400">
                  CAFLA
                </span>
              </Link>
            )}
          </div>

          <nav className="hidden xl:flex items-center gap-8 text-sm">
            {isHomePage &&
              navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="relative text-gray-300 transition hover:text-white"
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

            {!isHomePage &&
              internalNavLinks.map((link) => {
                const isActive = pathname === link.href

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative transition ${
                      isActive ? "text-yellow-400" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {link.name}

                    <span
                      className={`absolute -bottom-2 left-0 h-[2px] bg-yellow-400 transition-all duration-300 ${
                        isActive ? "w-full opacity-100" : "w-0 opacity-0"
                      }`}
                    />
                  </Link>
                )
              })}
          </nav>

          <div className="hidden xl:flex items-center gap-3">
            {isJoinPage ? (
              <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">
                Join CAFLA
              </span>
            ) : (
              <Link
                href="/join"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Join CAFLA
              </Link>
            )}

            <Link
              href="/login"
              className="inline-flex items-center rounded-lg border border-yellow-400 px-5 py-2.5 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
            >
              Member Login
            </Link>
          </div>

          <button
            className="xl:hidden text-white"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/70"
            onClick={closeMenu}
          />

          <div className="flex w-[300px] flex-col border-l border-white/10 bg-[#020B0A]">
            <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo/cafla-logo.png"
                  alt="CAFLA"
                  width={34}
                  height={34}
                />
                <span className="font-semibold text-yellow-400">CAFLA</span>
              </div>

              <button
                onClick={closeMenu}
                className="text-gray-400 hover:text-white"
                aria-label="Close menu"
              >
                <X size={26} />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6">
              {isHomePage &&
                landingNavLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="block w-full text-left text-lg text-gray-300 transition hover:text-white"
                  >
                    {link.name}
                  </button>
                ))}

              {!isHomePage &&
                internalNavLinks.map((link) => {
                  const isActive = pathname === link.href

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={`block w-full text-left text-lg transition ${
                        isActive ? "text-yellow-400" : "text-gray-300 hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                })}
            </div>

            <div className="space-y-4 border-t border-white/10 p-6">
              {isJoinPage ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-semibold text-white">
                  Join CAFLA
                </div>
              ) : (
                <Link
                  href="/join"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500"
                >
                  Join CAFLA
                </Link>
              )}

              <Link
                href="/login"
                onClick={closeMenu}
                className="block w-full rounded-lg border border-yellow-400 py-3 text-center font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
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