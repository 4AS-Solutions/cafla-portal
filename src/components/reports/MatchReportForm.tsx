"use client"

import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { createClient } from "@/src/lib/supabase/client"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MatchTimeline } from "../match/MatchTimeline"
import {
  Plus,
  Trash2,
  Goal,
  RectangleVertical,
  FileImage,
  MessageSquare,
  Trophy,
  Clock3,
} from "lucide-react"

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

function GoalRow({ index, register, remove }: any) {
  return (
    <div className="grid grid-cols-6 gap-3 items-center p-3 rounded-lg border border-white/10 bg-black/30">

      <select
        className="h-10 rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm"
        {...register(`goals.${index}.team`)}
      >
        <option value="home">Home</option>
        <option value="away">Away</option>
      </select>

      <Input
        placeholder="#"
        className="h-10 bg-[#0B0F0F]"
        {...register(`goals.${index}.player_number`)}
      />

      <Input
        placeholder="Player"
        className="h-10 bg-[#0B0F0F]"
        {...register(`goals.${index}.player_name`)}
      />

      <Input
        type="number"
        placeholder="Min"
        className="h-10 bg-[#0B0F0F]"
        {...register(`goals.${index}.minute`, { valueAsNumber: true })}
      />

      <select
        className="h-10 rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm"
        {...register(`goals.${index}.goal_type`)}
      >
        <option value="normal">Goal</option>
        <option value="penalty">Penalty</option>
        <option value="own_goal">Own Goal</option>
      </select>

      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={() => remove(index)}
      >
        <Trash2 size={16} />
      </Button>

    </div>
  )
}


function CardRow({ index, register, remove }: any) {
  return (
    <div className="grid grid-cols-7 gap-3 items-center p-3 rounded-lg border border-white/10 bg-black/30">

      <select
        className="h-10 rounded-md border border-white/10 bg-[#0B0F0F] px-3"
        {...register(`cards.${index}.team`)}
      >
        <option value="home">Home</option>
        <option value="away">Away</option>
      </select>

      <Input
        className="h-10 bg-[#0B0F0F]"
        {...register(`cards.${index}.player_number`)}
      />

      <Input
        className="h-10 bg-[#0B0F0F]"
        {...register(`cards.${index}.player_name`)}
      />

      <Input
        type="number"
        className="h-10 bg-[#0B0F0F]"
        {...register(`cards.${index}.minute`, { valueAsNumber: true })}
      />

      <select
        className="h-10 rounded-md border border-white/10 bg-[#0B0F0F]"
        {...register(`cards.${index}.card_type`)}
      >
        <option value="yellow">Yellow</option>
        <option value="red">Red</option>
      </select>

      <select
        className="h-10 rounded-md border border-white/10 bg-[#0B0F0F]"
        {...register(`cards.${index}.reason_code`)}
      >
        {CARD_REASONS.map((r: any) => (
          <option key={r}>{r}</option>
        ))}
      </select>

      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={() => remove(index)}
      >
        <Trash2 size={16} />
      </Button>

    </div>
  )
}

const darkSelectClass =
  "h-10 w-full rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm text-white outline-none transition focus:border-yellow-400/40"

export function MatchReportForm({ match }: MatchReportFormProps) {
  const supabase = createClient()
  const router = useRouter()

  const [submitting, setSubmitting] = useState(false)
  const [, setMessage] = useState<string | null>(null)
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
      {/* SCOREBOARD */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 sm:p-8 backdrop-blur-md">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
          <Trophy size={18} className="text-yellow-400" />
          Score
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center md:text-center">
          <div>
            <div className="mb-2 text-sm text-gray-400">{match.home_team}</div>
            <Input
              type="number"
              min={0}
              className="h-14 border-white/10 bg-[#0B0F0F] text-center text-2xl font-bold"
              {...form.register("home_score", { valueAsNumber: true })}
            />
          </div>

          <div className="hidden text-3xl font-bold text-gray-500 md:block">
            -
          </div>

          <div>
            <div className="mb-2 text-sm text-gray-400">{match.away_team}</div>
            <Input
              type="number"
              min={0}
              className="h-14 border-white/10 bg-[#0B0F0F] text-center text-2xl font-bold"
              {...form.register("away_score", { valueAsNumber: true })}
            />
          </div>
        </div>
      </section>

      {/* GOALS + CARDS */}
      <div className="space-y-6">
        {/* GOALS */}
        <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Goal size={18} className="text-yellow-400" />
              Goals
            </h2>

            <Button
              type="button"
              variant="ghost"
              className="gap-2 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
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
              <Plus size={16} />
              Add Goal
            </Button>
          </div>

          {goalsArray.fields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-gray-500">
              No goals added.
            </div>
          ) : (
            <div className="space-y-2">
              {goalsArray.fields.map((field, index) => (
                <GoalRow
                  key={field.id}
                  index={index}
                  register={form.register}
                  remove={goalsArray.remove}
                />
              ))}
              </div>
          )}
        </section>

        {/* CARDS */}
        <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <RectangleVertical size={18} className="text-yellow-400" />
              Cards
            </h2>

            <Button
              type="button"
              variant="ghost"
              className="gap-2 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
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
              <Plus size={16} />
              Add Card
            </Button>
          </div>

          {cardsArray.fields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-gray-500">
              No cards added.
            </div>
          ) : (
            <div className="space-y-2">
              {cardsArray.fields.map((field, index) => (
                <CardRow
                  key={field.id}
                  index={index}
                  register={form.register}
                  remove={cardsArray.remove}
                />
              ))}
              </div>
          )}
        </section>
      </div>

      {/* TIMELINE */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Clock3 size={18} className="text-yellow-400" />
          Timeline Preview
        </h2>

        <div className="mb-4 flex justify-between text-sm text-gray-400">
          <span>{match.home_team}</span>
          <span>{match.away_team}</span>
        </div>

        <MatchTimeline events={timelinePreview} />
      </section>

      {/* DOCUMENTS */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <FileImage size={18} className="text-yellow-400" />
          Match Documents
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Home Roster
            </label>
            <Input
              type="file"
              accept="image/*"
              className="border-white/10 bg-[#0B0F0F] cursor-pointer"
              onChange={(e) => setHomeRosterFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Away Roster
            </label>
            <Input
              type="file"
              accept="image/*"
              className="border-white/10 bg-[#0B0F0F] cursor-pointer"
              onChange={(e) => setAwayRosterFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      </section>

      {/* COMMENTS */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <MessageSquare size={18} className="text-yellow-400" />
          Comments
        </h2>

        <Textarea
          rows={5}
          className="border-white/10 bg-[#0B0F0F]"
          placeholder="Additional match notes..."
          {...form.register("comments")}
        />
      </section>

      {/* ERROR */}
      {errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end">
        <Button size="lg" className="px-10" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Match Report"}
        </Button>
      </div>
    </form>
  )
}