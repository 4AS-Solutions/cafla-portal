import { Navbar } from "@/src/components/landing/Navbar"
import { Hero } from "@/src/components/landing/Hero"
import { About } from "../components/landing/About"
import { Values } from "../components/landing/Values"
import { DevelopmentPlan } from "../components/landing/DevelopmentPlan"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <About />
      <Values />
      <DevelopmentPlan />
    </main>
  )
}