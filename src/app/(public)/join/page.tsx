import { Footer } from "@/src/components/landing/Footer";
import { DevelopmentEnvironment  } from "@/src/components/landing/join/DevelopmentEnvironment";
import { CommitmentStandards  } from "@/src/components/landing/join/CommitmentStandards";
import { JoinForm } from "@/src/components/landing/join/JoinForm";
import { JoinHero } from "@/src/components/landing/join/JoinHero";
import { FirstSessionOverview  } from "@/src/components/landing/join/FirstSessionOverview";
import { Navbar } from "@/src/components/landing/Navbar";


export default function JoinPage() {
  return (
    <main className="bg-[#050b0a]">
      <Navbar />

      {/* HERO */}
      <JoinHero />

      {/* FIRST SESSION OVERVIEW */}
      <FirstSessionOverview  />

      {/* COMMITMENT STANDARDS */}
      <CommitmentStandards  />

      {/* DEVELOPMENT ENVIRONMENT */}
      <DevelopmentEnvironment  />

      {/* FORM */}
      <JoinForm />

      <Footer />

    </main>
  )
}