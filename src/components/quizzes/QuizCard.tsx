import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  CalendarDays,
  ClipboardCheck,
  PlayCircle,
  BarChart3,
} from "lucide-react";
import { format } from "path";
import { formatMatchDate } from "@/src/lib/utils/format-date";

export default function QuizCard({ quiz }: any) {
  const now = new Date();

  const openFrom = quiz.open_from ? new Date(quiz.open_from) : null;
  const openUntil = quiz.open_until ? new Date(quiz.open_until) : null;

  const isOpen =
    (!openFrom || now >= openFrom) && (!openUntil || now <= openUntil);

  let status = "open";

  if (openFrom && now < openFrom) status = "upcoming";
  if (openUntil && now > openUntil) status = "closed";

  return (
    <div className="rounded-xl border border-white/10 p-5 bg-[#0B0F0F]/80 backdrop-blur-md hover:border-yellow-400/40 transition space-y-4">
      <div>
        <h3 className="font-semibold text-white">{quiz.title}</h3>

        <p className="text-sm text-gray-400 mt-1">{quiz.description}</p>
      </div>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} />
          {quiz.open_from ? formatMatchDate(quiz.open_from) : "Now"}
        </div>

        <div className="flex items-center gap-2">
          <ClipboardCheck size={14} />
          Quiz
        </div>
      </div>

      <div className="text-xs">
        {status === "open" && <span className="text-green-400">Open</span>}

        {status === "upcoming" && (
          <span className="text-yellow-400">Upcoming</span>
        )}

        {status === "closed" && <span className="text-red-400">Closed</span>}
      </div>

      {quiz.score && (
        <p className="text-sm text-gray-400 mt-2">
          Your score: {quiz.score}%
        </p>
      )}

      <div>
        {quiz.attempt_id ? (
          <Link href={`/portal/quizzes/review/${quiz.attempt_id}`}>
            <Button className="w-full">
              <BarChart3 size={16} className="mr-2" />
              View Results
            </Button>
          </Link>
        ) : isOpen ? (
          <Link href={`/portal/quizzes/${quiz.id}`}>
            <Button className="w-full">
              <PlayCircle size={16} className="mr-2" />
              Start Quiz
            </Button>
          </Link>
        ) : (
          <div className="text-xs text-gray-500">Quiz not available</div>
        )}
      </div>
    </div>
  );
}
