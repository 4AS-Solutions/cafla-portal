import { PortalSidebar } from "./PortalSidebar"
import { PortalTopbar } from "./PortalTopbar"

export function PortalShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#071f1c] to-[#021312] text-white">

      <PortalSidebar />

      <div className="flex flex-col flex-1">

        <PortalTopbar />

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>

      </div>

    </div>
  )
}