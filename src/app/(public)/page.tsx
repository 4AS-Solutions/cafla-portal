
// import { DevelopmentPlan } from "../components/landing/import { Calendar } from "../components/landing/Calendar"
// import { Macron } from "../components/landing/Macron"

import { About } from "@/src/components/landing/About";
import { Calendar } from "@/src/components/landing/Calendar";
import { Contact } from "@/src/components/landing/Contact";
import { Footer } from "@/src/components/landing/Footer";
import { Hero } from "@/src/components/landing/Hero";
import { Macron2 } from "@/src/components/landing/Macron2";
import { Navbar } from "@/src/components/landing/Navbar";
import { Values } from "@/src/components/landing/Values";

// import { BoardSection } from "../components/landing/Board"

// import { Resources } from "../components/landing/Resources"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <About />
      <Values />

      {/* TODO: Move to dedicated public route (/development) */}
      {/* <DevelopmentPlan /> */}

      <Calendar />

      {/* TODO: Move to dedicated public route (/resources) if needed */}
      {/* <Resources /> */}

      {/* TODO: Evaluate if legacy section is still needed */}
      {/* <Macron /> */}

      <Macron2 />
      {/* <JoinCafla /> */}

      {/* TODO: Move full leadership content to dedicated public route (/leadership) */}
      {/* <BoardSection /> */}

      <Contact />
      <Footer />
    </main>
  )
}