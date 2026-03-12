import Link from "next/link"

export default function QuizList({ quizzes }: any) {

  if (!quizzes.length) {
    return <p className="text-gray-500">No quizzes available.</p>
  }

  return (

    <div className="grid md:grid-cols-2 gap-4">

      {quizzes.map((quiz: any) => (

        <div
          key={quiz.id}
          className="border rounded-lg p-4 space-y-2 bg-white"
        >

          <h2 className="font-semibold">
            {quiz.title}
          </h2>

          <p className="text-sm text-gray-500">
            {quiz.description}
          </p>

          <p className="text-xs text-gray-400">

            Available:

            {" "}
            {quiz.open_from
              ? new Date(quiz.open_from).toLocaleDateString()
              : "Now"}

            {" - "}

            {quiz.open_until
              ? new Date(quiz.open_until).toLocaleDateString()
              : "No deadline"}

          </p>

          <Link
            href={`/portal/quizzes/${quiz.id}`}
            className="text-blue-600 text-sm"
          >
            Start Quiz
          </Link>

        </div>

      ))}

    </div>

  )
}