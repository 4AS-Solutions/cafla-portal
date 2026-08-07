import { NextResponse } from "next/server"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

const allowedLanguages = [
  "es",
  "en",
] as const

type QuizLanguage =
  (typeof allowedLanguages)[number]

type VersionInput = {
  language?: unknown
  enabled?: unknown
  title?: unknown
  description?: unknown
  instructions?: unknown
}

type RouteContext = {
  params: Promise<{
    assessment_id: string
  }>
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    await requireBoard()

    const { assessment_id } =
      await context.params

    const body = await request.json()

    const rawVersions =
      Array.isArray(body?.versions)
        ? (body.versions as VersionInput[])
        : []

    if (!assessment_id) {
      return validationError(
        "Assessment ID is required."
      )
    }

    const supabaseAdmin =
      getSupabaseAdmin()

    const {
      data: assessment,
      error: assessmentError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_assessments")
      .select(`
        id,
        status,
        content_locked_at
      `)
      .eq("id", assessment_id)
      .maybeSingle()

    if (assessmentError) {
      throw new Error(
        "Unable to load the assessment."
      )
    }

    if (!assessment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Assessment not found.",
        },
        {
          status: 404,
        }
      )
    }

    if (assessment.content_locked_at) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Language versions cannot be changed after the first attempt begins.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      assessment.status === "closed" ||
      assessment.status === "archived"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This assessment can no longer be edited.",
        },
        {
          status: 409,
        }
      )
    }

    const versions = rawVersions.map(
      (version) => ({
        language: String(
          version.language ?? ""
        ).toLowerCase() as QuizLanguage,

        enabled:
          version.enabled === true,

        title: String(
          version.title ?? ""
        ).trim(),

        description: String(
          version.description ?? ""
        ).trim(),

        instructions: String(
          version.instructions ?? ""
        ).trim(),
      })
    )

    for (const language of allowedLanguages) {
      const version = versions.find(
        (item) =>
          item.language === language
      )

      if (!version) continue

      if (version.enabled) {
        if (!version.title) {
          return validationError(
            `${
              language === "es"
                ? "Spanish"
                : "English"
            } title is required.`
          )
        }

        const {
          error: upsertError,
        } = await supabaseAdmin
          .schema("development")
          .from("quiz_versions")
          .upsert(
            {
              assessment_id,
              language,
              title: version.title,
              description:
                version.description ||
                null,
              instructions:
                version.instructions ||
                null,
              updated_at: new Date()
                .toISOString(),
            },
            {
              onConflict:
                "assessment_id,language",
            }
          )

        if (upsertError) {
          console.error(
            "[QUIZ ADMIN] Version upsert error:",
            upsertError
          )

          throw new Error(
            `Unable to save the ${language} version.`
          )
        }
      } else {
        const {
          data: existingVersion,
          error: existingError,
        } = await supabaseAdmin
          .schema("development")
          .from("quiz_versions")
          .select("id")
          .eq(
            "assessment_id",
            assessment_id
          )
          .eq("language", language)
          .maybeSingle()

        if (existingError) {
          throw new Error(
            "Unable to verify the language version."
          )
        }

        if (existingVersion) {
          const {
            count,
            error: questionError,
          } = await supabaseAdmin
            .schema("development")
            .from("quiz_questions")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq(
              "version_id",
              existingVersion.id
            )

          if (questionError) {
            throw new Error(
              "Unable to verify translated questions."
            )
          }

          if ((count ?? 0) > 0) {
            return NextResponse.json(
              {
                success: false,
                error:
                  "A language containing questions cannot be disabled. Remove its translated questions first.",
              },
              {
                status: 409,
              }
            )
          }

          const { error: deleteError } =
            await supabaseAdmin
              .schema("development")
              .from("quiz_versions")
              .delete()
              .eq(
                "id",
                existingVersion.id
              )

          if (deleteError) {
            throw new Error(
              "Unable to remove the language version."
            )
          }
        }
      }
    }

    const {
      data: savedVersions,
      error: versionsError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_versions")
      .select(`
        id,
        language,
        title,
        description,
        instructions
      `)
      .eq(
        "assessment_id",
        assessment_id
      )
      .order("language", {
        ascending: true,
      })

    if (versionsError) {
      throw new Error(
        "Unable to reload language versions."
      )
    }

    if (
      !savedVersions ||
      savedVersions.length === 0
    ) {
      return validationError(
        "At least one language must be enabled."
      )
    }

    return NextResponse.json({
      success: true,
      versions: savedVersions,
    })
  } catch (error) {
    console.error(
      "[QUIZ ADMIN] Versions API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to save language versions."

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status:
          message === "Unauthorized"
            ? 401
            : 500,
      }
    )
  }
}

function validationError(
  message: string
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status: 400,
    }
  )
}