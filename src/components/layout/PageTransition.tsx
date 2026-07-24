"use client"

export function PageTransition({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#050b0a]">
      {children}
    </div>
  )
}