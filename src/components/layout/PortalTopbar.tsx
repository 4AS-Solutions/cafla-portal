import Image from "next/image"
import { UserMenu } from "./UserMenu"
import { getProfile } from "@/src/lib/queries/get-profile"

export async function PortalTopbar() {

  const data = await getProfile()

  if (!data) return null

  const { user, profile } = data

  return (
    <header className="h-16 flex items-center border-b border-white/10 px-6 bg-[#0B0F0F]">

      {/* Mobile Logo */}

      <div className="flex items-center gap-3 md:hidden">

        <Image
          src="/logo/cafla-logo.png"
          alt="CAFLA"
          width={28}
          height={28}
        />

        <span className="font-semibold text-white">
          CAFLA
        </span>

      </div>

      {/* Right Side */}

      <div className="ml-auto">

        <UserMenu
          name={profile?.full_name ?? "User"}
          email={user.email ?? ""}
          role={profile?.role ?? "member"}
        />

      </div>

    </header>
  )
}