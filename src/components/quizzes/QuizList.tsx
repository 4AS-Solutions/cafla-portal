import QuizCard from "./QuizCard"

export default function QuizList({ quizzes }: any) {

  if (!quizzes.length) {
    return <p className="text-muted-foreground">No quizzes available.</p>
  }

  return (

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

      {quizzes.map((quiz: any) => (

        <QuizCard
          key={quiz.id}
          quiz={quiz}
        />

      ))}

    </div>

  )
}