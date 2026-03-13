import { PortalShell } from "@/src/components/layout/PortalShell"
import { requireUser } from "@/src/lib/auth/require-user"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CAFLA Portal",
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()

  return <PortalShell>{children}</PortalShell>
}