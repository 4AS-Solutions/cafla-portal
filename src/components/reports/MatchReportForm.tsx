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
import MatchRosterAttachmentSection, { ExistingRosterAttachment, RosterUploadMode } from "./components/match-report-form/MatchRosterAttachmentSection"
import { deleteMatchRoster, uploadMatchRoster } from "@/src/lib/storage/match-rosters"
import { MatchReportValidationError, validateMatchReport } from "./components/match-report-form/utils/validateMatchReport"



type InitialReportData = {
  id: string
  status?: "pending" | "submitted" | "revision_required" | "approved"
  home_score?: number | null
  away_score?: number | null
  comments?: string | null
  goals?: Goal[]
  cards?: Card[]
  assets: ExistingRosterAttachment[]
}

type MatchReportFormProps = {
  match: {
    id: string
    arbiter_match_id: string
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

  const existingRosterAttachments =
  initialData?.assets ?? []

  const existingCombinedAttachment =
    existingRosterAttachments.find(
      (asset) =>
        asset.asset_type === "roster_combined"
    ) ?? null

  const existingHomeAttachment =
    existingRosterAttachments.find(
      (asset) =>
        asset.asset_type === "roster_home"
    ) ?? null

  const existingAwayAttachment =
    existingRosterAttachments.find(
      (asset) =>
        asset.asset_type === "roster_away"
    ) ?? null

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

  const [validationErrors, setValidationErrors] =
    useState<MatchReportValidationError[]>([])

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

    const assets = initialData.assets ?? []

    const hasCombined = assets.some(
      (asset) =>
        asset.asset_type === "roster_combined"
    )

    const hasSeparate = assets.some(
      (asset) =>
        asset.asset_type === "roster_home" ||
        asset.asset_type === "roster_away"
    )

    if (hasCombined) {
      setRosterUploadMode("combined")
    } else if (hasSeparate) {
      setRosterUploadMode("separate")
    }
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

  async function submitReport(
    values: MatchReportFormData
  ) {
    if (isReadOnly) return

    setSubmitting(true)
    setMessage(null)
    setErrorMessage(null)

    /*
    * Guarda solamente los archivos nuevos subidos
    * durante este intento. Si el request falla,
    * estos son los únicos que debemos eliminar.
    */
    const uploadedRosterPaths: string[] = []

    try {
      if (!user) {
        throw new Error(
          "Your session is unavailable. Please refresh the page and try again."
        )
      }

      if (
        !match.center_referee_id ||
        user.id !== match.center_referee_id
      ) {
        throw new Error(
          "Only the center referee can submit this report."
        )
      }

      if (!match.arbiter_match_id) {
        throw new Error(
          "This match does not have a valid Arbiter match ID."
        )
      }

      let combinedRosterPath: string | null =
        null

      let homeRosterPath: string | null =
        null

      let awayRosterPath: string | null =
        null

      // =============================================
      // ROSTER VALIDATION AND UPLOAD
      // =============================================

      if (rosterUploadMode === "combined") {
        /*
        * Debe existir un archivo nuevo o uno previo.
        */
        if (
          !combinedRosterFile &&
          !existingCombinedAttachment
        ) {
          throw new Error(
            "Please attach the file containing both team rosters."
          )
        }

        /*
        * Si eligió reemplazo, subimos el archivo nuevo.
        * Si no, conservamos el storage_path existente.
        */
        if (combinedRosterFile) {
          combinedRosterPath =
            await uploadMatchRoster({
              supabase,
              arbiterMatchId: String(
                match.arbiter_match_id
              ),
              type: "combined",
              file: combinedRosterFile,
            })

          uploadedRosterPaths.push(
            combinedRosterPath
          )
        } else {
          combinedRosterPath =
            existingCombinedAttachment
              ?.storage_path ?? null
        }
      }

      if (rosterUploadMode === "separate") {
        const hasHomeRoster =
          Boolean(homeRosterFile) ||
          Boolean(existingHomeAttachment)

        const hasAwayRoster =
          Boolean(awayRosterFile) ||
          Boolean(existingAwayAttachment)

        if (!hasHomeRoster || !hasAwayRoster) {
          throw new Error(
            "Please attach both the Home and Away team rosters."
          )
        }

        /*
        * Home: subir reemplazo o conservar actual.
        */
        if (homeRosterFile) {
          homeRosterPath =
            await uploadMatchRoster({
              supabase,
              arbiterMatchId: String(
                match.arbiter_match_id
              ),
              type: "home",
              file: homeRosterFile,
            })

          uploadedRosterPaths.push(
            homeRosterPath
          )
        } else {
          homeRosterPath =
            existingHomeAttachment
              ?.storage_path ?? null
        }

        /*
        * Away: subir reemplazo o conservar actual.
        */
        if (awayRosterFile) {
          awayRosterPath =
            await uploadMatchRoster({
              supabase,
              arbiterMatchId: String(
                match.arbiter_match_id
              ),
              type: "away",
              file: awayRosterFile,
            })

          uploadedRosterPaths.push(
            awayRosterPath
          )
        } else {
          awayRosterPath =
            existingAwayAttachment
              ?.storage_path ?? null
        }
      }

      // =============================================
      // FINAL ASSET LIST
      // =============================================

      const finalAssets: Array<{
        asset_type:
          | "roster_combined"
          | "roster_home"
          | "roster_away"
        storage_path: string
      }> = []

      if (
        rosterUploadMode === "combined" &&
        combinedRosterPath
      ) {
        finalAssets.push({
          asset_type: "roster_combined",
          storage_path: combinedRosterPath,
        })
      }

      if (rosterUploadMode === "separate") {
        if (homeRosterPath) {
          finalAssets.push({
            asset_type: "roster_home",
            storage_path: homeRosterPath,
          })
        }

        if (awayRosterPath) {
          finalAssets.push({
            asset_type: "roster_away",
            storage_path: awayRosterPath,
          })
        }
      }

      // =============================================
      // PAYLOAD
      // =============================================

      const basePayload = {
        match_id: match.id,
        home_score: homeScore,
        away_score: awayScore,
        comments: values.comments,
        goals: values.goals,
        cards: values.cards,
      }

      /*
      * Create conserva el contrato actual.
      * Edit envía assets, porque eso es lo que
      * espera /api/reports/[report_id].
      */
      const payload = isEdit
        ? {
            ...basePayload,
            assets: finalAssets,
          }
        : {
            ...basePayload,
            roster_upload_mode:
              rosterUploadMode,
            combined_roster_path:
              combinedRosterPath,
            home_roster_path:
              homeRosterPath,
            away_roster_path:
              awayRosterPath,
          }

      const endpoint =
        isEdit && initialData?.id
          ? `/api/reports/${initialData.id}`
          : "/api/reports/submit"

      const method = isEdit
        ? "PATCH"
        : "POST"

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      // =============================================
      // RESPONSE HANDLING
      // =============================================

      const text = await res.text()

      let data: any = null

      try {
        data = text
          ? JSON.parse(text)
          : null
      } catch {
        throw new Error(
          "Invalid server response."
        )
      }

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Failed to submit report."
        )
      }

      // =============================================
      // DELETE REPLACED OLD FILES
      // ONLY AFTER SUCCESSFUL PATCH
      // =============================================

      if (isEdit) {
        const finalStoragePaths = new Set(
          finalAssets.map(
            (asset) =>
              asset.storage_path
          )
        )

        /*
        * Cualquier path anterior que ya no esté
        * en finalAssets fue sustituido.
        */
        const replacedOldPaths =
          existingRosterAttachments
            .map(
              (asset) =>
                asset.storage_path
            )
            .filter(
              (storagePath) =>
                !finalStoragePaths.has(
                  storagePath
                )
            )

        if (replacedOldPaths.length > 0) {
          const cleanupResults =
            await Promise.allSettled(
              replacedOldPaths.map(
                (storagePath) =>
                  deleteMatchRoster(
                    supabase,
                    storagePath
                  )
              )
            )

          cleanupResults.forEach(
            (result, index) => {
              if (
                result.status ===
                "rejected"
              ) {
                console.error(
                  `[REPORT] report updated, but old roster could not be deleted: ${replacedOldPaths[index]}`,
                  result.reason
                )
              }
            }
          )
        }
      }

      toast.success(
        isEdit
          ? "Match report updated and resubmitted successfully"
          : "Match report submitted successfully"
      )

      setCombinedRosterFile(null)
      setHomeRosterFile(null)
      setAwayRosterFile(null)

      router.push("/portal/reports")
    } catch (error) {
      console.error(
        "[REPORT] submit failed:",
        error
      )

      // =============================================
      // ROLLBACK NEWLY UPLOADED FILES
      // =============================================

      if (
        uploadedRosterPaths.length > 0
      ) {
        const rollbackResults =
          await Promise.allSettled(
            uploadedRosterPaths.map(
              (storagePath) =>
                deleteMatchRoster(
                  supabase,
                  storagePath
                )
            )
          )

        rollbackResults.forEach(
          (result, index) => {
            if (
              result.status ===
              "rejected"
            ) {
              console.error(
                `[REPORT] failed to delete roster during rollback: ${uploadedRosterPaths[index]}`,
                result.reason
              )
            }
          }
        )
      }

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
      (!c.notes || c.notes.trim() === "")
  )

  function handlePreSubmit(values: MatchReportFormData) {
    const validation = validateMatchReport(values)

      if (!validation.valid) {
        setValidationErrors(validation.errors)

        toast.error(
          "Please complete all required goal and card fields."
        )

        return
      }

      setValidationErrors([])

      // ---------------------------------------------
      // ROSTER ATTACHMENT VALIDATION
      // ---------------------------------------------

      if (!rosterUploadMode) {
        const message =
          "Please select how you will attach the team rosters."

        setErrorMessage(message)
        toast.error(message)

        return
      }

      if (
        rosterUploadMode === "combined" &&
        !combinedRosterFile &&
        !existingCombinedAttachment
      ) {
        const message =
          "Please attach the file containing both team rosters."

        setErrorMessage(message)
        toast.error(message)

        return
      }

      if (rosterUploadMode === "separate") {
        const hasHomeRoster =
          Boolean(homeRosterFile) ||
          Boolean(existingHomeAttachment)

        const hasAwayRoster =
          Boolean(awayRosterFile) ||
          Boolean(existingAwayAttachment)

        if (!hasHomeRoster || !hasAwayRoster) {
          const message =
            "Please attach both the Home and Away team rosters."

          setErrorMessage(message)
          toast.error(message)

          return
        }
      }

      setErrorMessage(null)

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

  const groupedValidationErrors = validationErrors.reduce<
    Record<string, MatchReportValidationError[]>
  >((groups, error) => {
    const key = `${error.section}-${error.row}`

    if (!groups[key]) {
      groups[key] = []
    }

    groups[key].push(error)

    return groups
  }, {})

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
          existingAttachments={ existingRosterAttachments}
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

        {validationErrors.length > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <p className="font-medium">
              Please review the following fields:
            </p>

            <div className="mt-3 space-y-4">
              {Object.entries(groupedValidationErrors).map(
                ([key, errors]) => {
                  const firstError = errors[0]

                  return (
                    <div key={key}>
                      <p className="font-semibold capitalize text-red-200">
                        {firstError.section} #{firstError.row}
                      </p>

                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        {errors.map((error) => (
                          <li
                            key={`${error.section}-${error.row}-${error.field}`}
                          >
                            {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                }
              )}
            </div>
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