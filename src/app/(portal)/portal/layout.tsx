import { PortalShell } from "@/src/components/layout/PortalShell"
import { requireUser } from "@/src/lib/auth/require-user"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()

  return <PortalShell>{children}</PortalShell>
}