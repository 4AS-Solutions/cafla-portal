
import { PortalSidebar } from "./PortalSidebar"
import { PortalTopbar } from "./PortalTopbar"

export function PortalShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">

      <PortalSidebar />

      <div className="flex flex-col flex-1">

        <PortalTopbar />

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>

      </div>

    </div>
  )
}