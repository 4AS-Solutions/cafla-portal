"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"

export function JoinForm() {

  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    willAttend: "yes",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section id="join-form" className="py-24 cafla-section text-center">

        <div className="max-w-xl mx-auto px-6">

          <CheckCircle className="w-14 h-14 text-yellow-400 mx-auto mb-6" />

          <h2 className="text-3xl text-white font-semibold mb-4">
            You're all set!
          </h2>

          <p className="text-gray-400 mb-6">
            We’ve received your information and look forward to meeting you this Friday.
          </p>

          <p className="text-gray-300 text-sm">
            If you have any questions before attending, feel free to reach out.
          </p>

        </div>

      </section>
    )
  }

  return (
    <section id="join-form" className="py-24 cafla-section">

      <div className="max-w-xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-12">

          <p className="text-sm uppercase tracking-[0.25em] text-yellow-400 mb-4">
            Confirm Attendance
          </p>

          <h2 className="text-3xl text-white font-semibold mb-4">
            Save Your Spot
          </h2>

          <p className="text-gray-400 text-sm">
            Let us know you're coming so we can welcome you and guide you during your first session.
          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="cafla-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md space-y-6"
        >

          {/* NAME */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          />

          {/* PHONE */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          />

          {/* ATTENDANCE */}
          <select
            name="willAttend"
            value={form.willAttend}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="yes">I will attend this Friday</option>
            <option value="maybe">Not sure yet</option>
          </select>

          {/* BUTTON */}
          <button
            type="submit"
            className="
              w-full
              bg-gradient-to-r from-yellow-400 to-yellow-500
              text-black font-semibold
              py-4 rounded-xl
              hover:scale-[1.02] transition
              duration-300
              shadow-xl shadow-yellow-500/20
            "
          >
            Confirm Attendance
          </button>

        </form>

      </div>

    </section>
  )
}