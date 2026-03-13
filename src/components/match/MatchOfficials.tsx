export default function MatchOfficials({ center, ar1, ar2 }: any) {

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-5 space-y-3">

      <h2 className="text-sm font-semibold text-gray-300">
        Officials
      </h2>

      <div className="space-y-1 text-sm">

        <div>
          <span className="inline-block w-8 text-gray-500">CR</span>
          <span className="font-medium text-white">
            {center?.full_name ?? "TBD"}
          </span>
        </div>

        <div>
          <span className="inline-block w-8 text-gray-500">AR1</span>
          <span className="font-medium text-white">
            {ar1?.full_name ?? "TBD"}
          </span>
        </div>

        <div>
          <span className="inline-block w-8 text-gray-500">AR2</span>
          <span className="font-medium text-white">
            {ar2?.full_name ?? "TBD"}
          </span>
        </div>

      </div>

    </div>
  )
}