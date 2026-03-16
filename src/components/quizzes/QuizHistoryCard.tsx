import Link from "next/link"
import { Button } from "@/src/components/ui/button"

export default function QuizHistoryCard({ attempt }: any) {

  return (

    <div className="rounded-xl border border-white/10 p-5 bg-[#0B0F0F]/80 backdrop-blur-md flex justify-between items-center">

      <div>

        <p className="font-semibold text-white">
          {attempt.quizzes.title}
        </p>

        <p className="text-sm text-gray-400">
          Score: {attempt.score}%
        </p>

      </div>

      <Link href={`/portal/quizzes/review/${attempt.id}`}>

        <Button
          size="sm"
          className="bg-[#0B0F0F] border border-white/10 hover:border-yellow-400/40"
        >
          Review
        </Button>

      </Link>

    </div>

  )
}