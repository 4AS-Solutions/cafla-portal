import Link from "next/link"

export default function Home() {
  return (
    <div className="p-10 space-y-4">
      <h1 className="text-3xl font-bold">CAFLA Platform</h1>

      <Link
        href="/portal"
        className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded"
      >
        Enter Portal
      </Link>
    </div>
  )
}