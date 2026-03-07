import Image from "next/image"
import { UserMenu } from "./UserMenu"
import { getProfile } from "@/src/lib/queries/get-profile"

export async function PortalTopbar() {

  const data = await getProfile()

  if (!data) return null

  const { user, profile } = data

  return (
    <header className="flex items-center justify-between border-b px-4 py-3 bg-background">

      <div className="flex items-center gap-3 md:hidden">
        <Image
          src="/logo/cafla-logo.png"
          alt="CAFLA"
          width={28}
          height={28}
        />
        <span className="font-semibold">
          CAFLA
        </span>
      </div>

      <UserMenu
        name={profile?.full_name ?? "User"}
        email={user.email ?? ""}
        role={profile?.role ?? "member"}
      />

    </header>
  )
}