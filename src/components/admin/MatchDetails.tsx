import MatchHeader from "./MatchHeader"
import MatchInfo from "./MatchInfo"
import MatchReferees from "./MatchReferees"
import MatchActions from "./MatchActions"

export default function MatchDetail({ match }: any) {

  return (
    <div className="max-w-4xl space-y-6">

      <MatchHeader match={match} />

      <div className="grid gap-4 md:grid-cols-2">

        <MatchInfo match={match} />
        <MatchReferees match={match} />

      </div>

      <MatchActions match={match} />

    </div>
  )
}