import { Input } from "@/src/components/ui/input"

type RosterUploadSectionProps = {
  isReadOnly: boolean
  setHomeRosterFile: (file: File | null) => void
  setAwayRosterFile: (file: File | null) => void
}

export default function RosterUploadSection({
  isReadOnly,
  setHomeRosterFile,
  setAwayRosterFile,
}: RosterUploadSectionProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Match Rosters
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {/* HOME */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Home Roster
          </label>

          <Input
            type="file"
            accept="image/*"
            disabled
            className="border-white/10 bg-[#0B0F0F] cursor-pointer disabled:opacity-60"
            onChange={(e) =>
              setHomeRosterFile(e.target.files?.[0] ?? null)
            }
          />
        </div>

        {/* AWAY */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Away Roster
          </label>

          <Input
            type="file"
            accept="image/*"
            disabled
            className="border-white/10 bg-[#0B0F0F] cursor-pointer disabled:opacity-60"
            onChange={(e) =>
              setAwayRosterFile(e.target.files?.[0] ?? null)
            }
          />
        </div>
      </div>
    </section>
  )
}