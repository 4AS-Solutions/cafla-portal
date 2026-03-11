"use client"

import { useState } from "react"
import { toast } from "sonner"

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

      if (!res.ok) {
        throw new Error(data.error)
      }

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

    <div className="space-y-6">

      <input
        placeholder="Quiz Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <div className="grid grid-cols-2 gap-4">

        <input
          type="datetime-local"
          value={openFrom}
          onChange={(e) => setOpenFrom(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="datetime-local"
          value={openUntil}
          onChange={(e) => setOpenUntil(e.target.value)}
          className="border p-2 rounded"
        />

      </div>

      <input
        type="number"
        placeholder="Time limit (minutes)"
        value={timeLimit}
        onChange={(e) => setTimeLimit(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <button
        onClick={addQuestion}
        className="bg-gray-200 px-4 py-2 rounded"
      >
        Add Question
      </button>

      {questions.map((q, index) => (

        <div
          key={index}
          className="border rounded p-4 space-y-3"
        >

          <textarea
            placeholder="Question"
            value={q.question_text}
            onChange={(e) =>
              updateQuestion(index, "question_text", e.target.value)
            }
            className="border p-2 rounded w-full"
          />

          <input
            placeholder="Option A"
            value={q.option_a}
            onChange={(e) =>
              updateQuestion(index, "option_a", e.target.value)
            }
            className="border p-2 rounded w-full"
          />

          <input
            placeholder="Option B"
            value={q.option_b}
            onChange={(e) =>
              updateQuestion(index, "option_b", e.target.value)
            }
            className="border p-2 rounded w-full"
          />

          <input
            placeholder="Option C"
            value={q.option_c}
            onChange={(e) =>
              updateQuestion(index, "option_c", e.target.value)
            }
            className="border p-2 rounded w-full"
          />

          <input
            placeholder="Option D"
            value={q.option_d}
            onChange={(e) =>
              updateQuestion(index, "option_d", e.target.value)
            }
            className="border p-2 rounded w-full"
          />

          <select
            value={q.correct_answer}
            onChange={(e) =>
              updateQuestion(index, "correct_answer", e.target.value)
            }
            className="border p-2 rounded"
          >
            <option value="a">Correct: A</option>
            <option value="b">Correct: B</option>
            <option value="c">Correct: C</option>
            <option value="d">Correct: D</option>
          </select>

          <textarea
            placeholder="Explanation"
            value={q.explanation}
            onChange={(e) =>
              updateQuestion(index, "explanation", e.target.value)
            }
            className="border p-2 rounded w-full"
          />

        </div>

      ))}

      <button
        onClick={submitQuiz}
        disabled={submitting}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Create Quiz
      </button>

    </div>

  )
}