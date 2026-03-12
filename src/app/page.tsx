import { Navbar } from "@/src/components/landing/Navbar"
import { Hero } from "@/src/components/landing/Hero"
import { About } from "../components/landing/About"
import { Values } from "../components/landing/Values"
import { DevelopmentPlan } from "../components/landing/DevelopmentPlan"
import { Calendar } from "../components/landing/Calendar"
import { Macron } from "../components/landing/Macron"
import { Macron2 } from "../components/landing/Macron2"
import { BecomeReferee } from "../components/landing/BecomeReferee"
import { BoardSection } from "../components/landing/Board"
import { Contact } from "../components/landing/Contact"
import { Footer } from "../components/landing/Footer"
import { Resources } from "../components/landing/Resources"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <About />
      <Values />
      <DevelopmentPlan />
      <Calendar />
      <Resources />
      {/* <Macron /> */}
      <Macron2 />
      <BecomeReferee />
      <BoardSection />
      <Contact />
      <Footer />
    </main>
  )
}