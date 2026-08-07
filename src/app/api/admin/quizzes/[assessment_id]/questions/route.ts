import { NextResponse } from "next/server"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

const allowedQuestionTypes = [
  "multiple_choice",
  "true_false",
] as const

type QuestionType =
  (typeof allowedQuestionTypes)[number]

type OptionInput = {
  text?: unknown
  is_correct?: unknown
}

type TranslationInput = {
  version_id?: unknown
  language?: unknown
  question_text?: unknown
  explanation?: unknown
  options?: unknown
}

type RouteContext = {
  params: Promise<{
    assessment_id: string
  }>
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    await requireBoard()

    const { assessment_id } =
      await context.params

    const body = await request.json()

    const questionType = String(
      body?.question_type ?? ""
    ) as QuestionType

    const translations =
      Array.isArray(body?.translations)
        ? (body.translations as TranslationInput[])
        : []

    if (!assessment_id) {
      return validationError(
        "Assessment ID is required."
      )
    }

    if (
      !allowedQuestionTypes.includes(
        questionType
      )
    ) {
      return validationError(
        "Select a valid question type."
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
          error: "Assessment not found.",
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
            "Questions cannot be changed after the first attempt begins.",
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

    const {
      data: versions,
      error: versionsError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_versions")
      .select(`
        id,
        language
      `)
      .eq("assessment_id", assessment_id)

    if (versionsError) {
      throw new Error(
        "Unable to load language versions."
      )
    }

    if (!versions?.length) {
      return validationError(
        "At least one language version is required."
      )
    }

    const normalizedTranslations =
      translations.map((translation) => {
        const options =
          Array.isArray(
            translation.options
          )
            ? (
                translation.options as OptionInput[]
              ).map((option) => ({
                text: String(
                  option.text ?? ""
                ).trim(),

                isCorrect:
                  option.is_correct === true,
              }))
            : []

        return {
          versionId: String(
            translation.version_id ?? ""
          ).trim(),

          language: String(
            translation.language ?? ""
          ).trim(),

          questionText: String(
            translation.question_text ?? ""
          ).trim(),

          explanation: String(
            translation.explanation ?? ""
          ).trim(),

          options,
        }
      })

    for (const version of versions) {
      const translation =
        normalizedTranslations.find(
          (item) =>
            item.versionId === version.id
        )

      if (!translation) {
        return validationError(
          `The ${getLanguageName(
            version.language
          )} translation is required.`
        )
      }

      if (!translation.questionText) {
        return validationError(
          `Question text is required in ${getLanguageName(
            version.language
          )}.`
        )
      }

      const expectedOptionCount =
        questionType === "true_false"
          ? 2
          : null

      if (
        expectedOptionCount !== null &&
        translation.options.length !==
          expectedOptionCount
      ) {
        return validationError(
          "True/False questions must contain exactly two options."
        )
      }

      if (
        questionType ===
          "multiple_choice" &&
        (translation.options.length < 2 ||
          translation.options.length > 4)
      ) {
        return validationError(
          "Multiple-choice questions must contain between two and four options."
        )
      }

      if (
        translation.options.some(
          (option) => !option.text
        )
      ) {
        return validationError(
          `Every answer option must contain text in ${getLanguageName(
            version.language
          )}.`
        )
      }

      const correctCount =
        translation.options.filter(
          (option) => option.isCorrect
        ).length

      if (correctCount !== 1) {
        return validationError(
          `Exactly one correct answer is required in ${getLanguageName(
            version.language
          )}.`
        )
      }
    }

    /*
     * Se calcula la siguiente posición visible.
     */
    const {
      data: lastGroup,
      error: positionError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_question_groups")
      .select("position")
      .eq("assessment_id", assessment_id)
      .order("position", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(1)
      .maybeSingle()

    if (positionError) {
      throw new Error(
        "Unable to determine the question position."
      )
    }

    const nextPosition =
      Number(lastGroup?.position ?? 0) + 1

    const {
      data: group,
      error: groupError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_question_groups")
      .insert({
        assessment_id,
        question_type: questionType,
        position: nextPosition,
        is_invalidated: false,
      })
      .select("id, position")
      .single()

    if (groupError) {
      console.error(
        "[QUIZ ADMIN] Question group error:",
        groupError
      )

      throw new Error(
        "Unable to create the question group."
      )
    }

    try {
      for (const version of versions) {
        const translation =
          normalizedTranslations.find(
            (item) =>
              item.versionId === version.id
          )!

        const {
          data: question,
          error: questionError,
        } = await supabaseAdmin
          .schema("development")
          .from("quiz_questions")
          .insert({
            question_group_id: group.id,
            version_id: version.id,
            question_text:
              translation.questionText,
            explanation:
              translation.explanation ||
              null,
          })
          .select("id")
          .single()

        if (questionError) {
          throw questionError
        }

        const optionRows =
          translation.options.map(
            (option, index) => ({
              question_id: question.id,
              option_text: option.text,
              is_correct:
                option.isCorrect,
              position: index + 1,
            })
          )

        const { error: optionsError } =
          await supabaseAdmin
            .schema("development")
            .from(
              "quiz_question_options"
            )
            .insert(optionRows)

        if (optionsError) {
          throw optionsError
        }
      }
    } catch (creationError) {
      /*
       * Compensación: al borrar el group,
       * los hijos deben eliminarse por FK
       * ON DELETE CASCADE.
       */
      await supabaseAdmin
        .schema("development")
        .from("quiz_question_groups")
        .delete()
        .eq("id", group.id)

      console.error(
        "[QUIZ ADMIN] Translation creation error:",
        creationError
      )

      throw new Error(
        "Unable to create all language translations."
      )
    }

    return NextResponse.json({
      success: true,
      questionGroup: {
        id: group.id,
        position: group.position,
      },
    })
  } catch (error) {
    console.error(
      "[QUIZ ADMIN] Create question API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create the question."

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

function getLanguageName(
  language: string
) {
  return language === "es"
    ? "Spanish"
    : language === "en"
      ? "English"
      : language
}