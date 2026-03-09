import { createClient } from "@/src/lib/supabase/server"
import { getUserMatches } from "@/src/lib/matches/get-user-matches"
import MatchList from "@/src/components/match/MatchList"

export default async function page() {

  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const matches = await getUserMatches(user.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        My Matches
      </h1>

      <MatchList matches={matches} />

    </div>
  )
}