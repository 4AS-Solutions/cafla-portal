"use client"

import { PageTransition } from "@/src/components/layout/PageTransition"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  )
}