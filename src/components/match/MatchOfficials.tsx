export default function MatchOfficials({ center, ar1, ar2 }: any) {

  return (
    <div className="space-y-2">

      <h2 className="font-semibold">
        Officials
      </h2>

      <div>Center: {center?.full_name ?? "TBD"}</div>
      <div>AR1: {ar1?.full_name ?? "TBD"}</div>
      <div>AR2: {ar2?.full_name ?? "TBD"}</div>

    </div>
  )
}