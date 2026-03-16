import { CheckCircle, XCircle } from "lucide-react"

export default function QuizReviewQuestionCard({ q, userAnswer, correct, index }: any) {

  const isCorrect = userAnswer === correct

  return (

    <div className="rounded-xl border border-white/10 p-5 bg-[#0B0F0F]/80 backdrop-blur-md space-y-3">

      <div className="flex items-center gap-2 text-white font-medium">

        {isCorrect
          ? <CheckCircle size={16} className="text-green-400"/>
          : <XCircle size={16} className="text-red-400"/>
        }

        {index + 1}. {q.question_text}

      </div>

      <p className="text-sm text-gray-300">
        Your answer: <b>{userAnswer?.toUpperCase()}</b>
      </p>

      <p className="text-sm text-gray-300">
        Correct answer: <b>{correct.toUpperCase()}</b>
      </p>

      {q.explanation && (

        <p className="text-sm text-gray-400">
          {q.explanation}
        </p>

      )}

    </div>

  )
}