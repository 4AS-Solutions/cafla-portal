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
    question_group_id: string
  }>
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    await requireBoard()

    const {
      assessment_id,
      question_group_id,
    } = await context.params

    if (!assessment_id) {
      return validationError(
        "Assessment ID is required."
      )
    }

    if (!question_group_id) {
      return validationError(
        "Question group ID is required."
      )
    }

    const body = await request.json()

    const questionType = String(
      body?.question_type ?? ""
    ) as QuestionType

    const translations =
      Array.isArray(body?.translations)
        ? (body.translations as TranslationInput[])
        : []

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

    // =========================================
    // ASSESSMENT
    // =========================================

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
      console.error(
        "[QUIZ ADMIN] Assessment lookup error:",
        assessmentError
      )

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

    // =========================================
    // LOCK PROTECTION
    // =========================================

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

    // =========================================
    // QUESTION GROUP
    // =========================================

    const {
      data: group,
      error: groupError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_question_groups")
      .select(`
        id,
        assessment_id,
        question_type
      `)
      .eq(
        "id",
        question_group_id
      )
      .eq(
        "assessment_id",
        assessment_id
      )
      .maybeSingle()

    if (groupError) {
      console.error(
        "[QUIZ ADMIN] Question group lookup error:",
        groupError
      )

      throw new Error(
        "Unable to load the question group."
      )
    }

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Question group not found.",
        },
        {
          status: 404,
        }
      )
    }

    // =========================================
    // LANGUAGE VERSIONS
    // =========================================

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
      .eq(
        "assessment_id",
        assessment_id
      )

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

    // =========================================
    // NORMALIZE + VALIDATE
    // =========================================

    const normalizedTranslations =
      translations.map(
        (translation) => {
          const options =
            Array.isArray(
              translation.options
            )
              ? (
                  translation.options as OptionInput[]
                ).map(
                  (option) => ({
                    text: String(
                      option.text ?? ""
                    ).trim(),

                    isCorrect:
                      option.is_correct ===
                      true,
                  })
                )
              : []

          return {
            versionId: String(
              translation.version_id ??
                ""
            ).trim(),

            language: String(
              translation.language ??
                ""
            ).trim(),

            questionText: String(
              translation.question_text ??
                ""
            ).trim(),

            explanation: String(
              translation.explanation ??
                ""
            ).trim(),

            options,
          }
        }
      )

    for (const version of versions) {
      const translation =
        normalizedTranslations.find(
          (item) =>
            item.versionId ===
            version.id
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

      if (
        questionType === "true_false" &&
        translation.options.length !==
          2
      ) {
        return validationError(
          "True/False questions must contain exactly two options."
        )
      }

      if (
        questionType ===
          "multiple_choice" &&
        (translation.options.length <
          2 ||
          translation.options.length >
            4)
      ) {
        return validationError(
          "Multiple-choice questions must contain between two and four options."
        )
      }

      if (
        translation.options.some(
          (option) =>
            !option.text
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
          (option) =>
            option.isCorrect
        ).length

      if (correctCount !== 1) {
        return validationError(
          `Exactly one correct answer is required in ${getLanguageName(
            version.language
          )}.`
        )
      }
    }

    // =========================================
    // UPDATE GROUP TYPE
    // =========================================

    const {
      error: groupUpdateError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_question_groups")
      .update({
        question_type:
          questionType,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        question_group_id
      )
      .eq(
        "assessment_id",
        assessment_id
      )

    if (groupUpdateError) {
      console.error(
        "[QUIZ ADMIN] Question group update error:",
        groupUpdateError
      )

      throw new Error(
        "Unable to update the question group."
      )
    }

    // =========================================
    // EXISTING TRANSLATED QUESTIONS
    // =========================================

    const {
      data: existingQuestions,
      error: existingQuestionsError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_questions")
      .select(`
        id,
        version_id
      `)
      .eq(
        "question_group_id",
        question_group_id
      )

    if (existingQuestionsError) {
      throw new Error(
        "Unable to load existing question translations."
      )
    }

    // =========================================
    // UPDATE EACH LANGUAGE
    // =========================================

    for (const version of versions) {
      const translation =
        normalizedTranslations.find(
          (item) =>
            item.versionId ===
            version.id
        )!

      const existingQuestion =
        existingQuestions?.find(
          (question) =>
            question.version_id ===
            version.id
        )

      let questionId: string

      if (existingQuestion) {
        questionId =
          existingQuestion.id

        const {
          error: questionUpdateError,
        } = await supabaseAdmin
          .schema("development")
          .from("quiz_questions")
          .update({
            question_text:
              translation.questionText,

            explanation:
              translation.explanation ||
              null,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            questionId
          )

        if (questionUpdateError) {
          throw new Error(
            `Unable to update the ${getLanguageName(
              version.language
            )} question.`
          )
        }
      } else {
        const {
          data: createdQuestion,
          error:
            questionCreateError,
        } = await supabaseAdmin
          .schema("development")
          .from("quiz_questions")
          .insert({
            question_group_id,
            version_id:
              version.id,

            question_text:
              translation.questionText,

            explanation:
              translation.explanation ||
              null,
          })
          .select("id")
          .single()

        if (questionCreateError) {
          throw new Error(
            `Unable to create the ${getLanguageName(
              version.language
            )} question.`
          )
        }

        questionId =
          createdQuestion.id
      }

      /*
       * Content is still unlocked,
       * therefore no attempt snapshot
       * depends on these options yet.
       *
       * Rebuilding the option set keeps
       * ordering and correctness simple.
       */
      const {
        error: deleteOptionsError,
      } = await supabaseAdmin
        .schema("development")
        .from(
          "quiz_question_options"
        )
        .delete()
        .eq(
          "question_id",
          questionId
        )

      if (deleteOptionsError) {
        throw new Error(
          `Unable to replace answer options in ${getLanguageName(
            version.language
          )}.`
        )
      }

      const optionRows =
        translation.options.map(
          (option, index) => ({
            question_id:
              questionId,

            option_text:
              option.text,

            is_correct:
              option.isCorrect,

            position:
              index + 1,
          })
        )

      const {
        error: optionsInsertError,
      } = await supabaseAdmin
        .schema("development")
        .from(
          "quiz_question_options"
        )
        .insert(optionRows)

      if (optionsInsertError) {
        throw new Error(
          `Unable to save answer options in ${getLanguageName(
            version.language
          )}.`
        )
      }
    }

    // =========================================
    // SUCCESS
    // =========================================

    return NextResponse.json({
      success: true,

      questionGroup: {
        id:
          question_group_id,

        questionType,
      },
    })
  } catch (error) {
    console.error(
      "[QUIZ ADMIN] Update question API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to update the question."

    if (
      message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Authentication is required.",
        },
        {
          status: 401,
        }
      )
    }

    if (
      message === "Forbidden"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Board access is required.",
        },
        {
          status: 403,
        }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    )
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    await requireBoard()

    const {
      assessment_id,
      question_group_id,
    } = await context.params

    if (!assessment_id) {
      return validationError(
        "Assessment ID is required."
      )
    }

    if (!question_group_id) {
      return validationError(
        "Question group ID is required."
      )
    }

    const supabaseAdmin =
      getSupabaseAdmin()

    // =========================================
    // LOAD ASSESSMENT
    // =========================================

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
      console.error(
        "[QUIZ ADMIN] Delete assessment lookup error:",
        assessmentError
      )

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

    // =========================================
    // LOCK PROTECTION
    // =========================================

    if (assessment.content_locked_at) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Questions cannot be deleted after the first attempt begins.",
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

    // =========================================
    // VERIFY QUESTION GROUP
    // =========================================

    const {
      data: group,
      error: groupError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_question_groups")
      .select(`
        id,
        assessment_id,
        position
      `)
      .eq(
        "id",
        question_group_id
      )
      .eq(
        "assessment_id",
        assessment_id
      )
      .maybeSingle()

    if (groupError) {
      console.error(
        "[QUIZ ADMIN] Delete question lookup error:",
        groupError
      )

      throw new Error(
        "Unable to load the question group."
      )
    }

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Question group not found.",
        },
        {
          status: 404,
        }
      )
    }

    // =========================================
    // DELETE QUESTION GROUP
    // =========================================

    /*
     * quiz_questions and
     * quiz_question_options are expected
     * to be removed through the existing
     * FK ON DELETE CASCADE relationships.
     *
     * Academic content is unlocked here,
     * so no member attempt snapshot should
     * depend on this question group.
     */
    const {
      error: deleteError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_question_groups")
      .delete()
      .eq(
        "id",
        question_group_id
      )
      .eq(
        "assessment_id",
        assessment_id
      )

    if (deleteError) {
      console.error(
        "[QUIZ ADMIN] Delete question group error:",
        deleteError
      )

      throw new Error(
        "Unable to delete the question group."
      )
    }

    return NextResponse.json({
      success: true,
      questionGroupId:
        question_group_id,
    })
  } catch (error) {
    console.error(
      "[QUIZ ADMIN] Delete question API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete the question."

    if (message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Authentication is required.",
        },
        {
          status: 401,
        }
      )
    }

    if (message === "Forbidden") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Board access is required.",
        },
        {
          status: 403,
        }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
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