"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

export default function CreateQuizForm() {

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [openFrom, setOpenFrom] = useState("")
  const [openUntil, setOpenUntil] = useState("")
  const [timeLimit, setTimeLimit] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)

  function addQuestion() {
    setQuestions([
      ...questions,
      {
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "a",
        explanation: ""
      }
    ])
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  function updateQuestion(index: number, field: string, value: string) {
    const updated = [...questions]
    updated[index][field] = value
    setQuestions(updated)
  }

  async function submitQuiz() {

    setSubmitting(true)

    try {

      const res = await fetch("/api/admin/quizzes/create", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          open_from: openFrom,
          open_until: openUntil,
          time_limit_minutes: timeLimit,
          questions
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      toast.success("Quiz created successfully")

      setTitle("")
      setDescription("")
      setOpenFrom("")
      setOpenUntil("")
      setTimeLimit("")
      setQuestions([])

    } catch (err: any) {
      toast.error(err.message)
    }

    setSubmitting(false)
  }

  return (

    <div className="space-y-8">

      {/* QUIZ INFO */}
      <div className="bg-[#0B0F0F] border border-white/10 rounded-2xl p-6 space-y-6">

        <div>
          <h3 className="text-lg font-semibold text-white">
            Quiz Information
          </h3>
          <p className="text-sm text-muted-foreground">
            Basic configuration of the quiz
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-dark"
          />

          <input
            type="number"
            placeholder="Time limit (minutes)"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            className="input-dark"
          />

          <input
            type="datetime-local"
            value={openFrom}
            onChange={(e) => setOpenFrom(e.target.value)}
            className="input-dark"
          />

          <input
            type="datetime-local"
            value={openUntil}
            onChange={(e) => setOpenUntil(e.target.value)}
            className="input-dark"
          />

        </div>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-dark w-full"
        />

      </div>

      {/* QUESTIONS */}
      <div className="space-y-6">

        <div className="flex items-center justify-between">

          <h3 className="text-lg font-semibold text-white">
            Questions
          </h3>

          <button
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00A86B] text-black font-medium hover:opacity-90"
          >
            <Plus size={16} />
            Add Question
          </button>

        </div>

        {questions.length === 0 && (
          <div className="text-sm text-gray-400">
            No questions added yet.
          </div>
        )}

        {questions.map((q, index) => (

          <div
            key={index}
            className="bg-[#0B0F0F] border border-white/10 rounded-2xl p-5 space-y-4"
          >

            {/* HEADER */}
            <div className="flex items-center justify-between">

              <p className="text-sm text-gray-400">
                Question #{index + 1}
              </p>

              <button
                onClick={() => removeQuestion(index)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
              </button>

            </div>

            {/* QUESTION */}
            <textarea
              placeholder="Write your question..."
              value={q.question_text}
              onChange={(e) =>
                updateQuestion(index, "question_text", e.target.value)
              }
              className="input-dark w-full"
            />

            {/* OPTIONS */}
            <div className="grid md:grid-cols-2 gap-3">

              <input
                placeholder="Option A"
                value={q.option_a}
                onChange={(e) =>
                  updateQuestion(index, "option_a", e.target.value)
                }
                className="input-dark"
              />

              <input
                placeholder="Option B"
                value={q.option_b}
                onChange={(e) =>
                  updateQuestion(index, "option_b", e.target.value)
                }
                className="input-dark"
              />

              <input
                placeholder="Option C"
                value={q.option_c}
                onChange={(e) =>
                  updateQuestion(index, "option_c", e.target.value)
                }
                className="input-dark"
              />

              <input
                placeholder="Option D"
                value={q.option_d}
                onChange={(e) =>
                  updateQuestion(index, "option_d", e.target.value)
                }
                className="input-dark"
              />

            </div>

            {/* CORRECT + EXPLANATION */}
            <div className="grid md:grid-cols-2 gap-3">

              <select
                value={q.correct_answer}
                onChange={(e) =>
                  updateQuestion(index, "correct_answer", e.target.value)
                }
                className="input-dark"
              >
                <option value="a">Correct: A</option>
                <option value="b">Correct: B</option>
                <option value="c">Correct: C</option>
                <option value="d">Correct: D</option>
              </select>

              <input
                placeholder="Explanation"
                value={q.explanation}
                onChange={(e) =>
                  updateQuestion(index, "explanation", e.target.value)
                }
                className="input-dark"
              />

            </div>

          </div>

        ))}

      </div>

      {/* SUBMIT */}
      <div className="flex justify-end">

        <button
          onClick={submitQuiz}
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-[#00A86B] text-black font-semibold hover:opacity-90"
        >
          {submitting ? "Creating..." : "Create Quiz"}
        </button>

      </div>

    </div>
  )
}