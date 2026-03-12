"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import { ScoreSelector } from "./ScoreSelector"

type Props = {
  matchId: string
  evaluatedId: string
}

export function EvaluationForm({ matchId, evaluatedId }: Props) {

  const [arrival, setArrival] = useState(3)
  const [fitness, setFitness] = useState(3)
  const [communication, setCommunication] = useState(3)
  const [teamwork, setTeamwork] = useState(3)
  const [professionalism, setProfessionalism] = useState(3)
  const [comments, setComments] = useState("")

  async function handleSubmit() {

    await fetch("/api/evaluations/submit", {
      method: "POST",
      body: JSON.stringify({
        matchId,
        evaluatedId,
        arrival,
        fitness,
        communication,
        teamwork,
        professionalism,
        comments
      })
    })

    location.href = "/portal/evaluations"
  }

  return (
    <div className="space-y-6">

      <ScoreSelector
        title="Arrival"
        value={arrival}
        onChange={setArrival}
        options={[
          { value: 5, label: "Arrived 40+ minutes early" },
          { value: 4, label: "Arrived 25 minutes early" },
          { value: 3, label: "Slightly late" },
          { value: 2, label: "Late" },
          { value: 1, label: "Very late" }
        ]}
      />

      <ScoreSelector
        title="Fitness"
        value={fitness}
        onChange={setFitness}
        options={[
          { value: 5, label: "Excellent fitness" },
          { value: 4, label: "Good fitness" },
          { value: 3, label: "Acceptable but struggled" },
          { value: 2, label: "Poor fitness" },
          { value: 1, label: "Did not keep up with play" }
        ]}
      />

      <ScoreSelector
        title="Communication"
        value={communication}
        onChange={setCommunication}
        options={[
          { value: 5, label: "Clear and constant communication" },
          { value: 4, label: "Good communication" },
          { value: 3, label: "Average communication" },
          { value: 2, label: "Poor communication" },
          { value: 1, label: "No communication" }
        ]}
      />

      <ScoreSelector
        title="Teamwork"
        value={teamwork}
        onChange={setTeamwork}
        options={[
          { value: 5, label: "Excellent teamwork" },
          { value: 4, label: "Good teamwork" },
          { value: 3, label: "Average teamwork" },
          { value: 2, label: "Weak teamwork" },
          { value: 1, label: "Poor teamwork" }
        ]}
      />

      <ScoreSelector
        title="Professionalism"
        value={professionalism}
        onChange={setProfessionalism}
        options={[
          { value: 5, label: "Excellent presentation and behavior" },
          { value: 4, label: "Good professionalism" },
          { value: 3, label: "Average professionalism" },
          { value: 2, label: "Poor professionalism" },
          { value: 1, label: "Unprofessional behavior" }
        ]}
      />

      <div className="space-y-2">
        <Textarea
          placeholder="Additional comments..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit}>
        Submit Evaluation
      </Button>

    </div>
  )
}