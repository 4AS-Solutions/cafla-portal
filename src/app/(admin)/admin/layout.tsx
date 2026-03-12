import { PortalShell } from "@/src/components/layout/PortalShell"
import { requireBoard } from "@/src/lib/auth/require-board"

export default async function layout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireBoard()

  return <PortalShell>{children}</PortalShell>
}