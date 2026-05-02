"use client"

import { useEffect, useState, useRef } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { createClient } from "@/src/lib/supabase/client"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
  auto_generated?: boolean
}

type FormData = {
  home_score: number
  away_score: number
  comments: string
  goals: GoalFormRow[]
  cards: CardFormRow[]
}

type InitialReportData = {
  id: string
  status?: "pending" | "submitted" | "revision_required" | "approved"
  home_score?: number | null
  away_score?: number | null
  comments?: string | null
  goals?: GoalFormRow[]
  cards?: CardFormRow[]
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
  mode: "create" | "edit" | "read"
  initialData?: InitialReportData | null
}

function GoalRow({
  index,
  register,
  remove,
  disabled,
}: any) {
  return (
    <div className="grid grid-cols-6 gap-3 items-center p-3 rounded-lg border border-white/10 bg-black/30">

      <select
        disabled={disabled}
        className="h-10 rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm disabled:opacity-60"
        {...register(`goals.${index}.team`)}
      >
        <option value="home">Home</option>
        <option value="away">Away</option>
      </select>

      <Input
        placeholder="#"
        disabled={disabled}
        className="h-10 bg-[#0B0F0F] disabled:opacity-60"
        {...register(`goals.${index}.player_number`)}
      />

      <Input
        placeholder="Player"
        disabled={disabled}
        className="h-10 bg-[#0B0F0F] disabled:opacity-60"
        {...register(`goals.${index}.player_name`)}
      />

      <Input
        type="number"
        placeholder="Min"
        disabled={disabled}
        className="h-10 bg-[#0B0F0F] disabled:opacity-60"
        {...register(`goals.${index}.minute`, { valueAsNumber: true })}
      />

      <select
        disabled={disabled}
        className="h-10 rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm disabled:opacity-60"
        {...register(`goals.${index}.goal_type`)}
      >
        <option value="normal">Goal</option>
        <option value="penalty">Penalty</option>
        <option value="own_goal">Own Goal</option>
      </select>

      {!disabled ? (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => remove(index)}
        >
          <Trash2 size={16} />
        </Button>
      ) : (
        <div />
      )}

    </div>
  )
}

function CardRow({
  index,
  register,
  remove,
  disabled,
  reasons,
  watch,
  setValue,
}: any) {

  // 🔥 UN SOLO WATCH (CLAVE)
  const card = watch(`cards.${index}`) || {}

  const cardType = card.card_type
  const reasonCode = card.reason_code
  const isAuto = card.auto_generated === true

  const isLocked = disabled || isAuto

  const filteredReasons = (reasons || []).filter(
    (r: any) => r.card_type === cardType
  )

  const selectedReason = (reasons || []).find(
    (r: any) => r.code === reasonCode
  )

  // ✅ evitar loop al cambiar tipo
  const prevTypeRef = useRef(cardType)

  useEffect(() => {
    if (prevTypeRef.current !== cardType) {
      prevTypeRef.current = cardType

      if (!isAuto) {
        setValue(`cards.${index}.reason_code`, "")
      }
    }
  }, [cardType, isAuto, index, setValue])

  // 🔥 FORZAR 2CT SIEMPRE
  useEffect(() => {
    if (isAuto && cardType === "red" && reasonCode !== "2CT") {
      setValue(`cards.${index}.reason_code`, "2CT", {
        shouldDirty: false,
      })
    }
  }, [isAuto, cardType, reasonCode, index, setValue])

  const isRed = cardType === "red";

  return (
    <div className="space-y-2">

      <div className="grid grid-cols-7 gap-3 items-center p-3 rounded-lg border border-white/10 bg-black/30">

        {/* TEAM */}
        <select
          disabled={isLocked}
          className="h-10 rounded-md border border-white/10 bg-[#0B0F0F] px-3 disabled:opacity-60"
          {...register(`cards.${index}.team`)}
        >
          <option value="home">Home</option>
          <option value="away">Away</option>
        </select>

        {/* NUMBER */}
        <Input
          placeholder="#"
          disabled={isLocked}
          className="h-10 bg-[#0B0F0F] disabled:opacity-60"
          {...register(`cards.${index}.player_number`)}
        />

        {/* NAME */}
        <Input
          placeholder="Player"
          disabled={isLocked}
          className="h-10 bg-[#0B0F0F] disabled:opacity-60"
          {...register(`cards.${index}.player_name`)}
        />

        {/* MINUTE */}
        <Input
          placeholder="Min"
          type="number"
          disabled={isLocked}
          className="h-10 bg-[#0B0F0F] disabled:opacity-60"
          {...register(`cards.${index}.minute`, { valueAsNumber: true })}
        />

        {/* CARD TYPE */}
        <select
          disabled={isLocked}
          className="h-10 rounded-md border border-white/10 bg-[#0B0F0F] disabled:opacity-60"
          {...register(`cards.${index}.card_type`)}
        >
          <option value="yellow">Yellow</option>
          <option value="red">Red</option>
        </select>

        {/* REASON */}
        {isLocked ? (
          <div className="h-10 flex items-center px-3 rounded-md border border-white/10 bg-[#0B0F0F] text-sm text-gray-300">
            {selectedReason
              ? `${selectedReason.code} - ${selectedReason.label}`
              : reasonCode === "2CT"
                ? "2CT - Second Caution"
                : "-"}
          </div>
        ) : (
          <select
            value={reasonCode || ""}
            className="h-10 rounded-md border border-white/10 bg-[#0B0F0F]"
            {...register(`cards.${index}.reason_code`)}
          >
            <option value="">Select</option>
            {filteredReasons.map((r: any) => (
              <option key={r.code} value={r.code}>
                {r.code} - {r.label}
              </option>
            ))}
          </select>
        )}

        {/* REMOVE */}
        {!isLocked ? (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash2 size={16} />
          </Button>
        ) : (
          <div />
        )}

      </div>

      {/* 🔴 RED CARD DESCRIPTION */}
      {isRed && !isAuto && !disabled && (
        <Textarea
          placeholder="Describe the reason for the red card..."
          className="bg-[#0B0F0F] border border-red-500/20 text-sm"
          {...register(`cards.${index}.notes`)}
        />
      )}

    </div>
  )
}


const darkSelectClass =
  "h-10 w-full rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm text-white outline-none transition focus:border-yellow-400/40 disabled:opacity-60"

export function MatchReportForm({
  match,
  mode,
  initialData,
}: MatchReportFormProps) {
  const supabase = createClient()
  const router = useRouter()



  const isReadOnly = mode === "read"
  const isEdit = mode === "edit"

  const [submitting, setSubmitting] = useState(false)
  const [, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [cardReasons, setCardReasons] = useState<any[]>([])
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

  const { watch, setValue } = form;

  const goalsArray = useFieldArray({
    control: form.control,
    name: "goals",
  })

  const cardsArray = useFieldArray({
    control: form.control,
    name: "cards",
  })

  const goals = form.watch("goals")
  const cards = form.watch("cards")

  const watchedCards = useWatch({
    control: form.control,
    name: "cards",
  })

  useEffect(() => {
    if (!initialData) return

    form.reset({
      home_score: initialData.home_score ?? 0,
      away_score: initialData.away_score ?? 0,
      comments: initialData.comments ?? "",
      goals: initialData.goals ?? [],
      cards: initialData.cards ?? [],
    })
  }, [initialData, form])

  useEffect(() => {
    async function loadReasons() {
      const { data, error } = await supabase
        .from("card_reasons")
        .select("*")

      if (error) {
        console.error(error)
        return
      }

      setCardReasons(data || [])
    }

    loadReasons()
  }, [])

  // Automatic Red Card
  useEffect(() => {
    if (!watchedCards) return

    // 🔥 1. separar manuales vs auto
    const manualCards = watchedCards.filter((c) => !c.auto_generated)

    // 🔥 2. separar incompletas (NO se deben borrar)
    const incompleteCards = manualCards.filter(
      (c) =>
        !c.player_number ||
        c.minute === undefined ||
        c.minute === null ||
        Number(c.minute) <= 0
    )

    // 🔥 3. tarjetas válidas (estas sí se procesan)
    const validCards = manualCards.filter(
      (c) =>
        c.player_number &&
        c.minute !== undefined &&
        c.minute !== null &&
        Number(c.minute) > 0
    )

    // 🔥 4. agrupar por jugador
    const grouped: Record<string, any[]> = {}

    validCards.forEach((c) => {
      const key = `${c.team}-${c.player_number}`

      if (!grouped[key]) grouped[key] = []

      grouped[key].push(c)
    })

    const autoCards: any[] = []

    // 🔥 5. lógica de 2 amarillas → roja automática
    Object.values(grouped).forEach((playerCards: any[]) => {
      const yellows = playerCards
        .filter((c) => c.card_type === "yellow")
        .sort((a, b) => (a.minute || 0) - (b.minute || 0))

      // 🚫 máximo 2 amarillas
      if (yellows.length > 2) {
        yellows.splice(2)
      }

      if (yellows.length >= 2) {
        const second = yellows[1] // 👈 SIEMPRE la segunda amarilla

        // 🚫 si ya hay roja manual → NO crear otra
        const hasManualRed = playerCards.some(
          (c) => c.card_type === "red" && !c.auto_generated
        )

        if (!hasManualRed) {
          autoCards.push({
            team: second.team,
            player_name: second.player_name,
            player_number: second.player_number,
            minute: Number(second.minute),
            card_type: "red",
            reason_code: "2CT",
            notes: "",
            auto_generated: true,
          })
        }
      }
    })

    // 🔥 6. limpiar duplicados manuales (máximo 2 amarillas por jugador)
    const cleanedManualCards: any[] = []

    const seen: Record<string, number> = {}

    validCards.forEach((c) => {
      const key = `${c.team}-${c.player_number}`

      if (!seen[key]) seen[key] = 0

      if (c.card_type === "yellow") {
        if (seen[key] < 2) {
          cleanedManualCards.push(c)
          seen[key]++
        }
      } else {
        cleanedManualCards.push(c)
      }
    })

    // 🔥 7. reconstruir TODO (IMPORTANTE)
    const nextCards = [
      ...incompleteCards, // 👈 NO desaparecen
      ...cleanedManualCards.map((c) => ({
        ...c,
        auto_generated: false,
      })),
      ...autoCards,
    ]

    // 🔥 8. evitar loop infinito
    const currentSerialized = JSON.stringify(watchedCards)
    const nextSerialized = JSON.stringify(nextCards)

    if (currentSerialized !== nextSerialized) {
      form.setValue("cards", nextCards, {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      })
    }
  }, [watchedCards, form])



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

  async function onSubmit(values: FormData) {
    if (isReadOnly) return


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

      const payload = {
        match_id: match.id,
        home_score: values.home_score,
        away_score: values.away_score,
        comments: values.comments,
        goals: values.goals,
        cards: values.cards,
        home_roster_path: homeRosterPath,
        away_roster_path: awayRosterPath,
      }

  

      const endpoint =
        isEdit && initialData?.id
          ? `/api/reports/${initialData.id}`
          : "/api/reports/submit"

      const method = isEdit ? "PATCH" : "POST"

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

      toast.success(
        isEdit
          ? "Match report updated successfully"
          : "Match report submitted successfully"
      )

      setHomeRosterFile(null)
      setAwayRosterFile(null)

      router.push("/portal/reports")
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


  const hasInvalidRed = (cards || []).some(
    (c) =>
      c.card_type === "red" &&
      !c.auto_generated &&
      (!c.notes || c.notes.trim() === "")
  )


  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {isEdit && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          This report requires corrections. Please update the necessary fields and resubmit.
        </div>
      )}

      {isReadOnly && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
          This report is in read-only mode.
        </div>
      )}

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
              disabled={isReadOnly}
              className="h-14 border-white/10 bg-[#0B0F0F] text-center text-2xl font-bold disabled:opacity-60"
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
              disabled={isReadOnly}
              className="h-14 border-white/10 bg-[#0B0F0F] text-center text-2xl font-bold disabled:opacity-60"
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

            {!isReadOnly && (
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
            )}
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
                  disabled={isReadOnly}
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

            {!isReadOnly && (
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
                    reason_code: "UB",
                    notes: "",
                    auto_generated: false
                  })
                }
              >
                <Plus size={16} />
                Add Card
              </Button>
            )}
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
                  disabled={isReadOnly}
                  reasons={cardReasons}
                  watch={form.watch}
                  setValue={form.setValue}
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

        <div className="mb-4 flex justify-around text-sm font-bold text-white">
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
              disabled={isReadOnly}
              className="border-white/10 bg-[#0B0F0F] cursor-pointer disabled:opacity-60"
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
              disabled={isReadOnly}
              className="border-white/10 bg-[#0B0F0F] cursor-pointer disabled:opacity-60"
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
          disabled={isReadOnly}
          className="border-white/10 bg-[#0B0F0F] disabled:opacity-60"
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

      {hasInvalidRed && (
        <div className="text-sm text-red-400">
          Red cards require a description before submitting the report.
        </div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end">
        <Button
          size="lg"
          className="px-10"
          type="submit"
          disabled={submitting || isReadOnly || hasInvalidRed }
        >
          {isReadOnly
            ? "View Only"
            : submitting
            ? isEdit
              ? "Updating..."
              : "Submitting..."
            : isEdit
            ? "Update Match Report"
            : "Submit Match Report"}
        </Button>
      </div>
    </form>
  )
}