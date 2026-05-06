"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"

export function JoinForm() {

  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    experienceLevel: "",
    ageRange: "",
    referralSource: "",
    attendanceIntent: "attend",
    message: "",
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })

  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // TODO:
    // Save to Supabase / CRM / onboarding pipeline

    console.log(form)

    setSubmitted(true)
  }

  // SUCCESS STATE
  if (submitted) {

    return (

      <section
        id="join-form"
        className="py-24 cafla-section text-center"
      >

        <div className="max-w-2xl mx-auto px-6">

          <CheckCircle className="w-14 h-14 text-yellow-400 mx-auto mb-6" />

          <h2 className="text-3xl text-white font-semibold mb-4">
            Request Received
          </h2>

          <p className="text-gray-400 mb-6 leading-relaxed">
            Your information has been submitted successfully.
            A CAFLA representative will contact you with details about the
            next available training session and introductory process.
          </p>

          <p className="text-gray-500 text-sm leading-relaxed">
            Thank you for your interest in referee development through CAFLA.
          </p>

        </div>

      </section>

    )

  }

  return (

    <section
      id="join-form"
      className="py-24 cafla-section"
    >

      <div className="max-w-2xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-12">

          <p className="text-sm uppercase tracking-[0.25em] text-yellow-400 mb-4">
            Introductory Session Request
          </p>

          <h2 className="text-3xl text-white font-semibold mb-4">
            Reserve Your Spot
          </h2>

          <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
            Submit your information to attend an upcoming CAFLA training session
            and learn more about the referee development process.
          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="
            cafla-card
            p-8
            rounded-3xl
            border border-white/10
            bg-white/5
            backdrop-blur-md
            space-y-6
          "
        >

          {/* NAME */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="
              w-full
              bg-black/40
              border border-white/10
              rounded-lg
              px-4 py-3
              text-white
              placeholder-gray-500
              focus:outline-none
              focus:border-yellow-400
            "
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="
              w-full
              bg-black/40
              border border-white/10
              rounded-lg
              px-4 py-3
              text-white
              placeholder-gray-500
              focus:outline-none
              focus:border-yellow-400
            "
          />

          {/* PHONE */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
            className="
              w-full
              bg-black/40
              border border-white/10
              rounded-lg
              px-4 py-3
              text-white
              placeholder-gray-500
              focus:outline-none
              focus:border-yellow-400
            "
          />

          {/* EXPERIENCE */}
          <select
            name="experienceLevel"
            value={form.experienceLevel}
            onChange={handleChange}
            required
            className="
              w-full
              bg-black/40
              border border-white/10
              rounded-lg
              px-4 py-3
              text-white
              focus:outline-none
              focus:border-yellow-400
            "
          >
            <option value="">Referee Experience Level</option>
            <option value="none">No Experience</option>
            <option value="some">Some Experience</option>
            <option value="certified">Currently Certified</option>
            <option value="former">Former Referee</option>
          </select>

          {/* AGE RANGE */}
          <select
            name="ageRange"
            value={form.ageRange}
            onChange={handleChange}
            required
            className="
              w-full
              bg-black/40
              border border-white/10
              rounded-lg
              px-4 py-3
              text-white
              focus:outline-none
              focus:border-yellow-400
            "
          >
            <option value="">Age Range</option>
            <option value="16-18">16 - 18</option>
            <option value="19-25">19 - 25</option>
            <option value="26-35">26 - 35</option>
            <option value="36+">36+</option>
          </select>

          {/* REFERRAL SOURCE */}
          <select
            name="referralSource"
            value={form.referralSource}
            onChange={handleChange}
            required
            className="
              w-full
              bg-black/40
              border border-white/10
              rounded-lg
              px-4 py-3
              text-white
              focus:outline-none
              focus:border-yellow-400
            "
          >
            <option value="">How did you hear about CAFLA?</option>
            <option value="website">Website</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="friend">Friend / Referee</option>
            <option value="league">League</option>
            <option value="google">Google Search</option>
            <option value="other">Other</option>
          </select>

          {/* ATTENDANCE INTENT */}
          <select
            name="attendanceIntent"
            value={form.attendanceIntent}
            onChange={handleChange}
            className="
              w-full
              bg-black/40
              border border-white/10
              rounded-lg
              px-4 py-3
              text-white
              focus:outline-none
              focus:border-yellow-400
            "
          >
            <option value="attend">
              I plan to attend the next session
            </option>

            <option value="info">
              I would like more information first
            </option>
          </select>

          {/* OPTIONAL MESSAGE */}
          <textarea
            name="message"
            placeholder="Optional Message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            className="
              w-full
              bg-black/40
              border border-white/10
              rounded-lg
              px-4 py-3
              text-white
              placeholder-gray-500
              focus:outline-none
              focus:border-yellow-400
              resize-none
            "
          />

          {/* NOTE */}
          <p className="text-xs text-gray-500 leading-relaxed">
            By submitting this form, you consent to being contacted by CAFLA regarding
            upcoming training sessions, referee development opportunities, and onboarding
            information. Information submitted through this form is used strictly for
            internal administrative and recruitment purposes and will not be shared with
            third parties. Submission of this form does not guarantee acceptance,
            certification, or match assignments within CAFLA.
          </p>

          {/* BUTTON */}
          <button
            type="submit"
            className="
              w-full
              bg-gradient-to-r
              from-yellow-400
              to-yellow-500
              text-black
              font-semibold
              py-4
              rounded-xl
              hover:scale-[1.02]
              transition
              duration-300
              shadow-xl
              shadow-yellow-500/20
            "
          >
            Submit Request
          </button>

        </form>

      </div>

    </section>

  )
}