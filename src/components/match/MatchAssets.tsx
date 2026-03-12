export default function MatchAssets({ assets }: any) {
  if (!assets?.length) return null

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Match Documents</h2>

      <div className="grid grid-cols-2 gap-4">
        {assets.map((a: any) => (
          <img
            key={a.id}
            src={a.file_path}
            className="rounded border"
          />
        ))}
      </div>
    </div>
  )
}