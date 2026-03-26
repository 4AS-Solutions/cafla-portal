"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/src/components/ui/button"

export default function QuizRunner({ quiz, questions }: any) {

  const [answers, setAnswers] = useState<any>({})
  const [current, setCurrent] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<number | null>(null)

  const [timeLeft, setTimeLeft] = useState(
    quiz.time_limit_minutes
      ? quiz.time_limit_minutes * 60
      : null
  )

  const total = questions.length
  const question = questions[current]

  useEffect(() => {

    if (!timeLeft) return

    const interval = setInterval(() => {

      setTimeLeft((prev: any) => {

        if (prev <= 1) {
          clearInterval(interval)
          submitQuiz()
          return 0
        }

        return prev - 1

      })

    }, 1000)

    return () => clearInterval(interval)

  }, [timeLeft])

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

      <div className="rounded-xl border border-white/10 p-6 bg-[#0B0F0F]/80 backdrop-blur-md space-y-4">

        <h2 className="text-xl font-semibold">
          Your Score: {result}%
        </h2>

        <p className="text-gray-400">
          Quiz completed successfully.
        </p>

      </div>

    )

  }

  const progress = Math.round(((current + 1) / total) * 100)

  return (

    <div className="space-y-6">

      {timeLeft && (

        <div className="flex justify-between text-sm text-gray-400">

          <span>Time Remaining</span>

          <span>

            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2,"0")}

          </span>

        </div>

      )}

      <div className="space-y-2">

        <div className="flex justify-between text-sm text-gray-400">

          <span>
            Question {current + 1} of {total}
          </span>

          <span>
            {progress}%
          </span>

        </div>

        <div className="w-full h-2 bg-white/10 rounded">

          <div
            className="h-2 bg-yellow-400 rounded"
            style={{ width: `${progress}%` }}
          />

        </div>

      </div>

      <div className="rounded-xl border border-white/10 p-6 bg-[#0B0F0F]/80 backdrop-blur-md space-y-4">

        <p className="font-medium text-lg">
          {question.question_text}
        </p>

        <div className="space-y-3">

          {["a","b","c","d"].map((opt) => {

            const value = question[`option_${opt}`]

            if (!value) return null

            const selected = answers[question.id] === opt

            return (

              <button
                key={opt}
                onClick={() => handleAnswer(question.id, opt)}
                className={`w-full text-left p-3 rounded-lg border transition
                ${
                  selected
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-white/10 hover:border-white/30"
                }`}
              >

                <span className="font-medium mr-2">
                  {opt.toUpperCase()}.
                </span>

                {value}

              </button>

            )

          })}

        </div>

      </div>

      <div className="flex justify-between">

        <Button
          variant="outline"
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
        >
          Previous
        </Button>

        {current === total - 1 ? (

          <Button
            onClick={submitQuiz}
            disabled={submitting}
          >
            Submit Quiz
          </Button>

        ) : (

          <Button
            onClick={() => setCurrent((c) => c + 1)}
          >
            Next
          </Button>

        )}

      </div>

    </div>

  )

}