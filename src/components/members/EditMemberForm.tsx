"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EditMemberForm({ member }: any) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    full_name: member.full_name,
    phone: member.phone || "",
    ussf_id: member.ussf_id || "",
    grade: member.grade || "",
    category: member.category || "",
    years_in_cafla: member.years_in_cafla || 0,
    role: member.role,
    status: member.status,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: name === "years_in_cafla" ? Number(value) : value,
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/members/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: member.id,
          ...form,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      router.refresh()
    } catch {
      setError("Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card-pro p-6 space-y-6">
        <h2 className="section-title">Profile Info</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <Input
            name="full_name"
            label="Full Name"
            value={form.full_name}
            onChange={handleChange}
          />

          <Input
            name="phone"
            label="Phone"
            value={form.phone}
            onChange={handleChange}
          />

          <Input
            name="ussf_id"
            label="USSF ID"
            value={form.ussf_id}
            onChange={handleChange}
          />

          <Input
            label="Email"
            value={member.email}
            disabled
          />
        </div>
      </div>

      <div className="card-pro p-6 space-y-6">
        <h2 className="section-title">Referee Info</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <Input
            name="grade"
            label="Grade"
            value={form.grade}
            onChange={handleChange}
          />

          <Input
            name="category"
            label="Category"
            value={form.category}
            onChange={handleChange}
          />

          <Input
            name="years_in_cafla"
            label="Years in CAFLA"
            type="number"
            value={form.years_in_cafla}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="card-pro p-6 space-y-6 border border-yellow-400/20">
        <h2 className="section-title text-yellow-400">
          System Control
        </h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <Select
            name="role"
            label="Role"
            value={form.role}
            onChange={handleChange}
            options={[
              { label: "Member", value: "member" },
              { label: "Board", value: "board" },
            ]}
          />

          <Select
            name="status"
            label="Status"
            value={form.status}
            onChange={handleChange}
            options={[
              { label: "Invited", value: "invited" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Suspended", value: "suspended" },
            ]}
          />
        </div>

        <p className="text-xs text-yellow-400/70">
          Changes here affect system permissions and access.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
            px-5 py-2.5 rounded-lg
            bg-white/5
            border border-white/10
            text-sm text-white
            hover:bg-white/10
            transition
          "
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  )
}

function Input({
  name,
  label,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  name?: string
  label: string
  value?: string | number
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  disabled?: boolean
  type?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="
          w-full px-3 py-2 rounded-lg
          bg-[#071f1c]
          border border-white/10
          text-sm text-white
          focus:outline-none
          focus:ring-2 focus:ring-emerald-500
          disabled:opacity-50
        "
      />
    </div>
  )
}

function Select({
  name,
  label,
  value,
  onChange,
  options,
}: {
  name: string
  label: string
  value: string
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  options: { label: string; value: string }[]
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full px-3 py-2 rounded-lg
          bg-[#071f1c]
          border border-white/10
          text-sm text-white
          focus:outline-none
          focus:ring-2 focus:ring-emerald-500
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}