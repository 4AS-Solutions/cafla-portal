"use client"

import { useState } from "react"
import { toast } from "sonner"

export default function QuizRunner({ quiz, questions }: any) {

  const [answers, setAnswers] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<number | null>(null)

  function handleAnswer(questionId: string, value: string) {
    setAnswers((prev: any) => ({
      ...prev,
      [questionId]: value
    }))
  }

  async function submitQuiz() {

    setSubmitting(true)

    try {

      const res = await fetch("/api/quizzes/submit", {
        method: "POST",
        body: JSON.stringify({
          quiz_id: quiz.id,
          answers
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setResult(data.score)

      toast.success(`Score: ${data.score}%`)

    } catch (err: any) {
      toast.error(err.message)
    }

    setSubmitting(false)

  }

  if (result !== null) {
    return (

      <div className="space-y-4">

        <h2 className="text-xl font-semibold">
          Your Score: {result}%
        </h2>

        <p className="text-gray-500">
          Quiz completed.
        </p>

      </div>

    )
  }

  return (

    <div className="space-y-6">

      {questions.map((q: any, index: number) => (

        <div
          key={q.id}
          className="border rounded-lg p-4 space-y-3"
        >

          <p className="font-medium">
            {index + 1}. {q.question_text}
          </p>

          {["a","b","c","d"].map((opt) => {

            const value = q[`option_${opt}`]

            if (!value) return null

            return (

              <label
                key={opt}
                className="flex items-center gap-2"
              >

                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  onChange={() => handleAnswer(q.id, opt)}
                />

                {value}

              </label>

            )

          })}

        </div>

      ))}

      <button
        onClick={submitQuiz}
        disabled={submitting}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Submit Quiz
      </button>

    </div>

  )
}