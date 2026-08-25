"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"

import { ScoreSelector } from "./ScoreSelector"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"

type Props = { matchId: string; evaluatedId: string }
type Score = number | null

const scoreOptions = {
  arrival: [
    { value: 5, label: "Arrived 40+ minutes early" },
    { value: 4, label: "Arrived 25 minutes early" },
    { value: 3, label: "Slightly late" },
    { value: 2, label: "Late" },
    { value: 1, label: "Very late" },
  ],
  fitness: [
    { value: 5, label: "Excellent fitness" },
    { value: 4, label: "Good fitness" },
    { value: 3, label: "Acceptable but struggled" },
    { value: 2, label: "Poor fitness" },
    { value: 1, label: "Did not keep up with play" },
  ],
  communication: [
    { value: 5, label: "Clear and constant communication" },
    { value: 4, label: "Good communication" },
    { value: 3, label: "Average communication" },
    { value: 2, label: "Poor communication" },
    { value: 1, label: "No communication" },
  ],
  teamwork: [
    { value: 5, label: "Excellent teamwork" },
    { value: 4, label: "Good teamwork" },
    { value: 3, label: "Average teamwork" },
    { value: 2, label: "Weak teamwork" },
    { value: 1, label: "Poor teamwork" },
  ],
  professionalism: [
    { value: 5, label: "Excellent presentation and behavior" },
    { value: 4, label: "Good professionalism" },
    { value: 3, label: "Average professionalism" },
    { value: 2, label: "Poor professionalism" },
    { value: 1, label: "Unprofessional behavior" },
  ],
}

export function EvaluationForm({ matchId, evaluatedId }: Props) {
  const [arrival, setArrival] = useState<Score>(null)
  const [fitness, setFitness] = useState<Score>(null)
  const [communication, setCommunication] = useState<Score>(null)
  const [teamwork, setTeamwork] = useState<Score>(null)
  const [professionalism, setProfessionalism] = useState<Score>(null)
  const [comments, setComments] = useState("")
  const [loading, setLoading] = useState(false)

  const isComplete = [arrival, fitness, communication, teamwork, professionalism]
    .every((score): score is number => score !== null)

  async function handleSubmit() {
    if (!isComplete) {
      toast.error("Please select a score for every category")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/evaluations/submit", {
        method: "POST",
        body: JSON.stringify({
          matchId,
          evaluatedId,
          arrival,
          fitness,
          communication,
          teamwork,
          professionalism,
          comments,
        }),
      })

      if (!res.ok) throw new Error("Failed to submit evaluation")

      toast.success("Evaluation submitted")
      window.location.href = "/portal/evaluations"
    } catch {
      toast.error("Error submitting evaluation")
      setLoading(false)
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault()
        void handleSubmit()
      }}
    >
      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-5 shadow-lg shadow-black/20 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Performance Scores</h2>
          <p className="mt-1 text-sm text-gray-400">Select one score for each category. All five scores are required.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <ScoreSelector title="Arrival" value={arrival} onChange={setArrival} options={scoreOptions.arrival} />
          <ScoreSelector title="Fitness" value={fitness} onChange={setFitness} options={scoreOptions.fitness} />
          <ScoreSelector title="Communication" value={communication} onChange={setCommunication} options={scoreOptions.communication} />
          <ScoreSelector title="Teamwork" value={teamwork} onChange={setTeamwork} options={scoreOptions.teamwork} />
          <div className="lg:col-span-2">
            <ScoreSelector title="Professionalism" value={professionalism} onChange={setProfessionalism} options={scoreOptions.professionalism} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-5 sm:p-6">
        <label htmlFor="evaluation-comments" className="text-sm font-semibold text-white">Additional comments</label>
        <p className="mt-1 text-xs text-gray-500">Optional</p>
        <Textarea
          id="evaluation-comments"
          className="mt-4 min-h-28 resize-y rounded-xl border-white/10 bg-white/[0.03] text-white placeholder:text-gray-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/15"
          placeholder="Share helpful context about the referee's performance..."
          value={comments}
          onChange={(event) => setComments(event.target.value)}
        />
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">Your evaluation cannot be edited after submission.</p>
        <Button type="submit" size="lg" disabled={loading || !isComplete} className="min-h-11 rounded-xl bg-yellow-400 px-5 font-semibold text-black hover:bg-yellow-300">
          <Send className="h-4 w-4" />
          {loading ? "Submitting..." : "Submit Evaluation"}
        </Button>
      </div>
    </form>
  )
}
