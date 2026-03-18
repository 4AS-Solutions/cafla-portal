"use client"

export default function AdminReportsFilters({
  search,
  setSearch,
  status,
  setStatus
}: any) {

  return (

    <div className="flex flex-col md:flex-row gap-3">

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search match or referee..."
        className="
          w-full md:w-72
          bg-[#0B0F0F]
          border border-white/10
          rounded-xl px-4 py-2
          text-sm text-white
          outline-none
          focus:border-emerald-500/50
        "
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="
          bg-[#0B0F0F]
          border border-white/10
          rounded-xl px-4 py-2
          text-sm text-white
        "
      >
        <option value="all">All Status</option>
        <option value="submitted">Submitted</option>
        <option value="approved">Approved</option>
        <option value="revision_required">Needs Review</option>
      </select>

    </div>
  )
}