"use client"

import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { createClient } from "@/src/lib/supabase/client"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MatchTimeline } from "../match/MatchTimeline"

type GoalFormRow = {
  team: "home" | "away"
  player_name: string
  player_number: string
  minute: number
  half: "first" | "second"
  goal_type: "normal" | "penalty" | "own_goal"
}

type CardFormRow = {
  team: "home" | "away"
  player_name: string
  player_number: string
  minute: number
  card_type: "yellow" | "red"
  reason_code: string
  notes?: string
}

type FormData = {
  home_score: number
  away_score: number
  comments: string
  goals: GoalFormRow[]
  cards: CardFormRow[]
}

type MatchReportFormProps = {
  match: {
    id: string
    home_team: string
    away_team: string
    center_referee_id: string | null
    assistant_referee_1_id?: string | null
    assistant_referee_2_id?: string | null
    field?: string | null
    location?: string | null
    kickoff_at?: string | null
  }
}

const CARD_REASONS = [
  "USB",
  "DISSENT",
  "PI",
  "DR",
  "FRD",
  "E",
  "DOGSO",
  "SFP",
  "VC",
  "2CT",
  "OFFINABUS",
  "SPITTING",
]

export function MatchReportForm({ match }: MatchReportFormProps) {
  const supabase = createClient();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [homeRosterFile, setHomeRosterFile] = useState<File | null>(null)
  const [awayRosterFile, setAwayRosterFile] = useState<File | null>(null)

  const form = useForm<FormData>({
    defaultValues: {
      home_score: 0,
      away_score: 0,
      comments: "",
      goals: [],
      cards: [],
    },
  })

  const goals = form.watch("goals")
  const cards = form.watch("cards")

  const timelinePreview = [
    ...(goals ?? []).map((g) => ({
      minute: g.minute,
      type: "goal" as const,
      player: g.player_name,
      number: g.player_number,
      team: g.team,
    })),
    ...(cards ?? []).map((c) => ({
      minute: c.minute,
      type: "card" as const,
      player: c.player_name,
      number: c.player_number,
      team: c.team,
      card_type: c.card_type,
    })),
  ].sort((a, b) => a.minute - b.minute)

  const goalsArray = useFieldArray({
    control: form.control,
    name: "goals",
  })

  const cardsArray = useFieldArray({
    control: form.control,
    name: "cards",
  })

  async function onSubmit(values: FormData) {
    setSubmitting(true)
    setMessage(null)
    setErrorMessage(null)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("You must be logged in to submit this report.")
      }

      if (!match.center_referee_id || user.id !== match.center_referee_id) {
        throw new Error("Only the center referee can submit this report.")
      }

      let homeRosterPath: string | null = null
      let awayRosterPath: string | null = null

      /*
      -----------------------------
      Upload HOME roster
      -----------------------------
      */

      if (homeRosterFile) {
        homeRosterPath = `${match.id}/home-${Date.now()}-${homeRosterFile.name}`

        const { error: uploadHomeError } = await supabase.storage
          .from("match-rosters")
          .upload(homeRosterPath, homeRosterFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadHomeError) {
          throw new Error("Failed to upload home roster.")
        }
      }

      /*
      -----------------------------
      Upload AWAY roster
      -----------------------------
      */

      if (awayRosterFile) {
        awayRosterPath = `${match.id}/away-${Date.now()}-${awayRosterFile.name}`

        const { error: uploadAwayError } = await supabase.storage
          .from("match-rosters")
          .upload(awayRosterPath, awayRosterFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadAwayError) {
          throw new Error("Failed to upload away roster.")
        }
      }

      /*
      -----------------------------
      Send report to API
      -----------------------------
      */

      const res = await fetch("/api/reports/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          match_id: match.id,
          home_score: values.home_score,
          away_score: values.away_score,
          comments: values.comments,
          goals: values.goals,
          cards: values.cards,
          home_roster_path: homeRosterPath,
          away_roster_path: awayRosterPath,
        }),
      })

      let data: any = null

      try {
        data = await res.json()
      } catch {
        throw new Error("Invalid server response.")
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit report.")
      }

      /*
      -----------------------------
      SUCCESS
      -----------------------------
      */

      toast.success("Match report submitted successfully")

      setHomeRosterFile(null)
      setAwayRosterFile(null)

      router.push("/portal")
      router.refresh()
    } catch (error) {
      console.error(error)

      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."

      toast.error(message)

      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Score */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Score</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              {match.home_team} Score
            </label>
            <Input
              type="number"
              min={0}
              {...form.register("home_score", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              {match.away_team} Score
            </label>
            <Input
              type="number"
              min={0}
              {...form.register("away_score", { valueAsNumber: true })}
            />
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Goals</h2>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              goalsArray.append({
                team: "home",
                player_name: "",
                player_number: "",
                minute: 0,
                half: "first",
                goal_type: "normal",
              })
            }
          >
            + Add Goal
          </Button>
        </div>

        {goalsArray.fields.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No goals added.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Minute</TableHead>
                  <TableHead>Half</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[90px]">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {goalsArray.fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <select
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        {...form.register(`goals.${index}.team`)}
                      >
                        <option value="home">Home</option>
                        <option value="away">Away</option>
                      </select>
                    </TableCell>

                    <TableCell>
                      <Input {...form.register(`goals.${index}.player_number`)} />
                    </TableCell>

                    <TableCell>
                      <Input {...form.register(`goals.${index}.player_name`)} />
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        {...form.register(`goals.${index}.minute`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>

                    <TableCell>
                      <select
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        {...form.register(`goals.${index}.half`)}
                      >
                        <option value="first">1st</option>
                        <option value="second">2nd</option>
                      </select>
                    </TableCell>

                    <TableCell>
                      <select
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        {...form.register(`goals.${index}.goal_type`)}
                      >
                        <option value="normal">Goal</option>
                        <option value="penalty">Penalty</option>
                        <option value="own_goal">Own Goal</option>
                      </select>
                    </TableCell>

                    <TableCell>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => goalsArray.remove(index)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cards</h2>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              cardsArray.append({
                team: "home",
                player_name: "",
                player_number: "",
                minute: 0,
                card_type: "yellow",
                reason_code: "USB",
                notes: "",
              })
            }
          >
            + Add Card
          </Button>
        </div>

        {cardsArray.fields.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No cards added.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Minute</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[90px]">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {cardsArray.fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <select
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        {...form.register(`cards.${index}.team`)}
                      >
                        <option value="home">Home</option>
                        <option value="away">Away</option>
                      </select>
                    </TableCell>

                    <TableCell>
                      <Input {...form.register(`cards.${index}.player_number`)} />
                    </TableCell>

                    <TableCell>
                      <Input {...form.register(`cards.${index}.player_name`)} />
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        {...form.register(`cards.${index}.minute`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>

                    <TableCell>
                      <select
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        {...form.register(`cards.${index}.card_type`)}
                      >
                        <option value="yellow">Yellow</option>
                        <option value="red">Red</option>
                      </select>
                    </TableCell>

                    <TableCell>
                      <select
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        {...form.register(`cards.${index}.reason_code`)}
                      >
                        {CARD_REASONS.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </TableCell>

                    <TableCell>
                      <Input {...form.register(`cards.${index}.notes`)} />
                    </TableCell>

                    <TableCell>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => cardsArray.remove(index)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Match Info */}


      {/* Timeline Preview */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">
          Timeline Preview
        </h2><hr className="mb-4" />

        <div className="flex justify-around text-sm font-semibold mb-4">
          <span>{match.home_team}</span>
          <span>{match.away_team}</span>
        </div>

        <MatchTimeline events={timelinePreview} />
      </div>

      {/* Rosters */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Roster Photos</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Home Roster
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setHomeRosterFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Away Roster
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setAwayRosterFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      </section>

      {/* Comments */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Comments</h2>

        <Textarea
          rows={5}
          placeholder="Additional match notes..."
          {...form.register("comments")}
        />
      </section>

      {/* Messages */}
      {message && (
        <div className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  )
}