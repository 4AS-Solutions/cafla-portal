import { MatchRoleIcon } from "../icons/MatchRoleIcon";

export default function MatchOfficials({ center, ar1, ar2 }: any) {

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-5 space-y-3">

      <h2 className="text-sm font-semibold text-gray-300">
        Officials
      </h2>

      <div className="space-y-1 text-sm">

        <div className="flex items-center gap-3">
          <MatchRoleIcon
            role="cr"
            size={28}
          />
          <span className="w-8 text-[#D4A93A]/80">
            CR
          </span>
          <span className="font-medium text-white">
            {center?.full_name ?? "TBD"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <MatchRoleIcon
            role="ar"
            size={28}
          />
          <span className="w-8 text-[#D4A93A]/80">
            AR1
          </span>
          <span className="font-medium text-white">
            {ar1?.full_name ?? "TBD"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <MatchRoleIcon
            role="ar"
            size={28}
          />
          <span className="w-8 text-[#D4A93A]/80">
            AR2
          </span>
          <span className="font-medium text-white">
            {ar2?.full_name ?? "TBD"}
          </span>
        </div>

      </div>
    </div>
  )
}