import { redirect } from "next/navigation"

import { Metadata } from "next"

import { PortalShell } from "@/src/components/layout/PortalShell"

import { requireUser } from "@/src/lib/auth/require-user"

import { supabaseServer } from "@/src/lib/supabase/server"

export const metadata: Metadata = {
  title: "CAFLA Portal",
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {

  // =========================================
  // 🔐 REQUIRE AUTH
  // =========================================
  const user = await requireUser()

  // =========================================
  // 🔥 LOAD MEMBER PROFILE
  // =========================================
  const supabase = await supabaseServer()

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  // =========================================
  // 🚫 INVALID MEMBER
  // =========================================
  if (!member) {

    redirect("/login")
  }

  // =========================================
  // 🚨 MEMBER STATUS
  // =========================================
  const status = member.status

  // =========================================
  // 🧠 INVITED USER
  // =========================================
  if (status === "invited") {

    redirect("/complete-profile")
  }

  // =========================================
  // 🚫 INACTIVE / BLOCKED
  // =========================================
  if (
    status !== "active"
  ) {

    redirect("/login")
  }

  // =========================================
  // ✅ RENDER PORTAL
  // =========================================
  return (
    <PortalShell>

      {children}

    </PortalShell>
  )
}