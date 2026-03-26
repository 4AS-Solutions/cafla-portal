"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

import { UserPlus } from "lucide-react"

export default function InviteMemberDialog() {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/admin/members/invite", {
      method: "POST",
      body: JSON.stringify({
        email,
        full_name: fullName,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      alert(data.error || "Something went wrong")
      return
    }

    setEmail("")
    setFullName("")
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      {/* BUTTON — ALINEADO A TU SISTEMA */}
      <DialogTrigger asChild>
        <Button
          className="
            flex items-center gap-2
            bg-[#0b1513]
            border border-emerald-900/40
            text-white
            hover:border-yellow-400/40
            hover:text-yellow-300
            transition
          "
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </DialogTrigger>

      {/* MODAL — CON CONTRASTE REAL */}
      <DialogContent
        className="
          rounded-xl
          bg-[#0b1513]
          border border-emerald-900/40
          shadow-2xl shadow-black/50
          backdrop-blur
          max-w-md
        "
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-white">
            Invite Member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* FULL NAME */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Full Name
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="
                bg-[#0b1513]
                border border-emerald-900/40
                text-white
                focus:border-yellow-400/40
                focus:ring-0
              "
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Email
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                bg-[#0b1513]
                border border-emerald-900/40
                text-white
                focus:border-yellow-400/40
                focus:ring-0
              "
            />
          </div>

          {/* SUBMIT — MISMO ESTILO QUE ACTIONS */}
          <Button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-[#0b1513]
              border border-emerald-900/40
              text-white
              hover:border-yellow-400/40
              hover:text-yellow-300
              transition
            "
          >
            {loading ? "Sending..." : "Send Invitation"}
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  )
}