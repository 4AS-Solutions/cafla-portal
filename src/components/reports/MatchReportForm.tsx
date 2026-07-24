"use client"

import { useEffect, useState, useRef } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { supabase } from "@/src/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import ScoreboardSection from "./components/match-report-form/ScoreboardSection"
import CommentsSection from "./components/match-report-form/CommentsSection"
import SubmitSection from "./components/match-report-form/SubmitSetion"
import {GoalsSection} from "./components/match-report-form/GoalsSection"
import { CardsSection } from "./components/match-report-form/CardsSection"
import { useAutoSecondYellow } from "./components/match-report-form/hooks/useAutoSecondYellow"
import { useCardReasons } from "./components/match-report-form/hooks/useCardReasons"
import { Card, Goal, MatchReportFormData } from "./components/match-report-form/match-report.types"
import { useIsMobile } from "./components/match-report-form/hooks/useIsMobile"
import { TimelinePreviewSection } from "./components/match-report-form/TimelinePreviewSection"
import { useMatchRoster } from "./components/match-report-form/hooks/useMatchRoster"
import { MatchReportConfirmationDialog } from "./components/match-report-form/ConfirmDialog"
import { useAuth } from "../providers/AuthProvider"
import MatchRosterAttachmentSection, { RosterUploadMode } from "./components/match-report-form/MatchRosterAttachmentSection"

type InitialReportData = {
  id: string
  status?: "pending" | "submitted" | "revision_required" | "approved"
  home_score?: number | null
  away_score?: number | null
  comments?: string | null
  goals?: Goal[]
  cards?: Card[]
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

export function MatchReportForm({
  match,
  mode,
  initialData,
}: MatchReportFormProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Detect mobile for better form UX
  const isMobile = useIsMobile()

  const { players: rosterPlayers, loading: rosterLoading } = useMatchRoster(match.id);

  const isReadOnly = mode === "read"
  const isEdit = mode === "edit"

  const [submitting, setSubmitting] = useState(false)
  const [, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [confirmationType, setConfirmationType] = useState<
    "no-goals" | "no-cards" | null
  >(null)

  const [pendingSubmitValues, setPendingSubmitValues] =
    useState<MatchReportFormData | null>(null)

  const [rosterUploadMode, setRosterUploadMode] =
    useState<RosterUploadMode>(null)

  const [combinedRosterFile, setCombinedRosterFile] =
    useState<File | null>(null)

  const [homeRosterFile, setHomeRosterFile] =
    useState<File | null>(null)

  const [awayRosterFile, setAwayRosterFile] =
    useState<File | null>(null)

  const form = useForm<MatchReportFormData>({
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

  // 🔥 LIVE SCORE
  const homeScore = (goals || []).filter(
    (goal) => goal.team === "home"
  ).length

  const awayScore = (goals || []).filter(
    (goal) => goal.team === "away"
  ).length

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

  // Load card reasons
  const { cardReasons, loading: loadingCardReasons } = useCardReasons()

  // Automatic Red Card
  useAutoSecondYellow({
    watchedCards,
    form,
  })

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

  async function submitReport(values: MatchReportFormData) {
    if (isReadOnly) return

    console.log("[REPORT] submit started")

    setSubmitting(true)
    setMessage(null)
    setErrorMessage(null)

    try {
      console.log("[REPORT] validating current user")

      if (!user) {
        throw new Error(
          "Your session is unavailable. Please refresh the page and try again."
        )
      }

      console.log("[REPORT] current user available")

      if (!match.center_referee_id || user.id !== match.center_referee_id) {
        throw new Error("Only the center referee can submit this report.")
      }

      let homeRosterPath: string | null = null
      let awayRosterPath: string | null = null

      // ---------------------------------------------
      // HOME ROSTER UPLOAD
      // ---------------------------------------------

      if (homeRosterFile) {
        console.log("Uploading home roster...")

        homeRosterPath = `${match.id}/home-${Date.now()}-${homeRosterFile.name}`

        const { error: uploadHomeError } = await supabase.storage
          .from("match-rosters")
          .upload(homeRosterPath, homeRosterFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadHomeError) {
          console.error(uploadHomeError)
          throw new Error("Failed to upload home roster.")
        }

        console.log("Home roster uploaded successfully")
      }

      // ---------------------------------------------
      // AWAY ROSTER UPLOAD
      // ---------------------------------------------

      if (awayRosterFile) {
        console.log("Uploading away roster...")

        awayRosterPath = `${match.id}/away-${Date.now()}-${awayRosterFile.name}`

        const { error: uploadAwayError } = await supabase.storage
          .from("match-rosters")
          .upload(awayRosterPath, awayRosterFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadAwayError) {
          console.error(uploadAwayError)
          throw new Error("Failed to upload away roster.")
        }

        console.log("Away roster uploaded successfully")
      }

      // ---------------------------------------------
      // PAYLOAD
      // ---------------------------------------------

      console.log("📦📦📦📦 Building payload...")
      const payload = {
        match_id: match.id,
        home_score: homeScore,
        away_score: awayScore,
        comments: values.comments,
        goals: values.goals,
        cards: values.cards,
        home_roster_path: homeRosterPath,
        away_roster_path: awayRosterPath,
      }

      // console.log("✔️✔️✔️✔️ Payload ready", payload)
      console.log("✔️✔️✔️✔️ Payload ready")

      const endpoint =
        isEdit && initialData?.id
          ? `/api/reports/${initialData.id}`
          : "/api/reports/submit"

      const method = isEdit ? "PATCH" : "POST"

      console.log("📡 Sending request...")
      // console.log("🔺🔺🔺🔺🔺 Endpoint:", endpoint)
      console.log("🔺🔺🔺🔺🔺 Endpoint: ")
      // console.log("❗❗❗❗❗ Method:", method)
      console.log("❗❗❗❗❗ Method: ")

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      // console.log("☑️☑️☑️☑️☑️ Response received: ", res.status)
      console.log("☑️☑️☑️☑️☑️ Response received: ")

      // ---------------------------------------------
      // SAFER RESPONSE HANDLING
      // ---------------------------------------------

      console.log("📥📥📥📥 Reading response body...")
      const text = await res.text()
      console.log("📨📨📨📨📨 Response body read.")

      let data: any = null

      try {
        data = text ? JSON.parse(text) : null
      } catch {
        throw new Error("Invalid server response.")
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit report.")
      }

      console.log("Report submitted successfully")

      toast.success(
        isEdit
          ? "Match report updated successfully"
          : "Match report submitted successfully"
      )

      setHomeRosterFile(null)
      setAwayRosterFile(null)

      // ---------------------------------------------
      // IMPORTANT:
      // REMOVE router.refresh()
      // ---------------------------------------------

      console.log("🎊🎊🎊🎊 SUCCESS redirecting...")
      router.push("/portal/reports")
    } catch (error) {
      console.log("❌ SUBMIT FAILED")
      console.error(error)

      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."

      toast.error(message)
      setErrorMessage(message)
    } finally {
      console.log("🧹 Cleaning submit state...")
      setSubmitting(false)
    }
  }

  const hasInvalidRed = (cards || []).some(
    (c) =>
      c.card_type === "red" &&
      (!c.notes || c.notes.trim() === "")
  )

  function handlePreSubmit(values: MatchReportFormData) {

    // ---------------------------------------------
    // NO GOALS CONFIRMATION
    // ---------------------------------------------

    if ((values.goals || []).length === 0) {

      setPendingSubmitValues(values)

      setConfirmationType("no-goals")

      return
    }

    // ---------------------------------------------
    // NO CARDS CONFIRMATION
    // ---------------------------------------------

    if ((values.cards || []).length === 0) {

      setPendingSubmitValues(values)

      setConfirmationType("no-cards")

      return
    }

    // ---------------------------------------------
    // DIRECT SUBMIT
    // ---------------------------------------------

    submitReport(values)
  }

  async function handleConfirmation() {

    if (!pendingSubmitValues) return

    // ---------------------------------------------
    // FIRST STEP:
    // NO GOALS
    // ---------------------------------------------

    if (
      confirmationType === "no-goals" &&
      (pendingSubmitValues.cards || []).length === 0
    ) {

      setConfirmationType("no-cards")

      return
    }

    // ---------------------------------------------
    // FINAL SUBMIT
    // ---------------------------------------------

    setConfirmationType(null)

    await submitReport(pendingSubmitValues)

    setPendingSubmitValues(null)
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(handlePreSubmit)} className="space-y-8">
        {isEdit && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
            This report requires corrections. Please update the necessary fields and resubmit.
          </div>
        )}

        {isReadOnly && (
          <div className="rounded-xl border border-whiando las props,
          te/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
            This report is in read-only mode.
          </div>
        )}

        {/* SCOREBOARD */}
        <ScoreboardSection
          homeTeam={match.home_team}
          awayTeam={match.away_team}
          homeScore={homeScore}
          awayScore={awayScore}
        />

        {/* GOALS + CARDS */}
        <div className="space-y-6">
          {/* GOALS */}
          <GoalsSection
            goalsArray={goalsArray}
            register={form.register}
            isReadOnly={isReadOnly}
            isMobile={isMobile}
            players={rosterPlayers}
            setValue={form.setValue}
            watch={watch}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
          />

          {/* CARDS */}
          <CardsSection
            cardsArray={cardsArray}
            register={form.register}
            isReadOnly={isReadOnly}
            reasons={cardReasons}
            loadingReasons={loadingCardReasons}
            watch={watch}
            setValue={setValue}
            isMobile={isMobile}
            players={rosterPlayers}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
          />

        </div>

        {/* TIMELINE */}
        <TimelinePreviewSection
          match={match}
          timelinePreview={timelinePreview}
        />

        {/* DOCUMENTS */}
        <MatchRosterAttachmentSection
          isReadOnly={isReadOnly}
          rosterUploadMode={rosterUploadMode}
          setRosterUploadMode={setRosterUploadMode}
          combinedRosterFile={combinedRosterFile}
          setCombinedRosterFile={setCombinedRosterFile}
          homeRosterFile={homeRosterFile}
          setHomeRosterFile={setHomeRosterFile}
          awayRosterFile={awayRosterFile}
          setAwayRosterFile={setAwayRosterFile}
        />

        {/* COMMENTS */}
        <CommentsSection
          register={form.register}
          isReadOnly={isReadOnly}
        />

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
        <SubmitSection
          submitting={submitting}
          isReadOnly={isReadOnly}
          isEdit={isEdit}
          hasInvalidRed={hasInvalidRed}
        />
      </form>

      <MatchReportConfirmationDialog
        open={confirmationType !== null}
        type={confirmationType}
        onCancel={() => {
          setConfirmationType(null)

          toast.info(
            "Please review and register all relevant match events before submitting the report."
          )
        }}
        onConfirm={handleConfirmation}
      />
    
    </>
  )
}