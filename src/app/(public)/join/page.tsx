import { Footer } from "@/src/components/landing/Footer";
import { Benefits } from "@/src/components/landing/join/Benefits";
import { ImportantInfo } from "@/src/components/landing/join/ImportantInfo";
import { JoinForm } from "@/src/components/landing/join/JoinForm";
import { JoinHero } from "@/src/components/landing/join/JoinHero";
import { NextSession } from "@/src/components/landing/join/NextSession";
import { Navbar } from "@/src/components/landing/Navbar";


export default function JoinPage() {
  return (
    <main className="bg-[#050b0a]">
      <Navbar />

      {/* HERO */}
      <JoinHero />

      {/* WHAT HAPPENS */}
      <NextSession />

      {/* IMPORTANT INFO */}
      <ImportantInfo />

      {/* BENEFITS */}
      <Benefits />

      {/* FORM */}
      <JoinForm />

      <Footer />

    </main>
  )
}