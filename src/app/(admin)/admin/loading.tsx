export default function Loading() {

  return (
    <div className="portal-layout flex min-h-screen text-white relative overflow-hidden">

      {/* Ambient Light */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-200px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-yellow-400/6 blur-[160px]" />
      </div>

      {/* CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">

          {/* HEADER */}
          <div className="mb-10 space-y-4">

            <div className="h-10 w-72 rounded-xl bg-white/5 animate-pulse" />

            <div className="h-5 w-96 rounded-lg bg-white/5 animate-pulse" />

          </div>

          {/* STATS */}
          <div className="grid gap-6 md:grid-cols-3 mb-10">

            {Array.from({ length: 3 }).map((_, i) => (

              <div
                key={i}
                className="h-32 rounded-3xl border border-white/10 bg-white/5 animate-pulse"
              />

            ))}

          </div>

          {/* CARDS */}
          <div className="grid gap-6 lg:grid-cols-2">

            {Array.from({ length: 4 }).map((_, i) => (

              <div
                key={i}
                className="h-[260px] rounded-3xl border border-white/10 bg-white/5 animate-pulse"
              />

            ))}

          </div>

        </main>

      </div>

    </div>
  )
}