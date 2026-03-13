export default function MatchAssets({ assets }: any) {

  if (!assets?.length) return null

  return (

    <div className="rounded-xl border border-white/10 bg-[#0B0F0F]/80 backdrop-blur-md p-5 space-y-4">

      <h2 className="text-sm font-semibold text-gray-300">
        Match Documents
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        {assets.map((a: any) => (

          <img
            key={a.id}
            src={a.file_path}
            className="rounded-lg border border-white/10 hover:opacity-90 transition"
          />

        ))}

      </div>

    </div>

  )
}