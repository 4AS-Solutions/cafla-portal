"use client"

import { Mail, Phone, User } from "lucide-react"

export function BoardSection() {

  const board = [
    {
      name: "Alfredo Sandoval Victorio",
      role: "President",
      email: "president@cafla.org",
      phone: "+1 (323) 555-0110",
    },
    {
      name: "Jose Carranza",
      role: "Vice President",
      email: "vicepresident@cafla.org",
      phone: "+1 (323) 555-0111",
    },
    {
      name: "Ruben Conde",
      role: "Treasurer",
      email: "treasurer@cafla.org",
      phone: "+1 (323) 555-0112",
    },
    {
      name: "Luis P. Salvador H.",
      role: "Secretary",
      email: "secretary@cafla.org",
      phone: "+1 (323) 555-0113",
    },
  ]

  const assignors = [
    {
      name: "Ruben Conde",
      role: "Weekly Assignor",
      email: "assignor@cafla.org",
      phone: "+1 (323) 555-0201",
    },
    {
      name: "Mario Gonzalez",
      role: "Sunday Assignor",
      email: "assignor2@cafla.org",
      phone: "+1 (323) 555-0202",
    },
  ]

  const instructors = [
    {
      name: "Michael Hayfrod",
      role: "Referee Instructor",
      email: "instructor@cafla.org",
      phone: "+1 (323) 555-0301",
    },
    {
      name: "Carlos Hernandez",
      role: "Referee Instructor",
      email: "instructor2@cafla.org",
      phone: "+1 (323) 555-0302",
    },
    {
      name: "Antonio Tamayo",
      role: "Referee Instructor",
      email: "instructor3@cafla.org",
      phone: "+1 (323) 555-0303",
    },
  ]

  const Card = ({ person }: any) => (
    <div className="cafla-card p-8 rounded-2xl hover:scale-[1.03] transition-all duration-300">

      <div className="w-14 h-14 rounded-full bg-yellow-400/20 flex items-center justify-center mb-6">
        <User className="text-yellow-400" size={26}/>
      </div>

      <h4 className="text-white text-lg font-semibold mb-1">
        {person.name}
      </h4>

      <p className="text-yellow-400 text-sm mb-5">
        {person.role}
      </p>

      <div className="space-y-2 text-sm text-gray-400">

        <div className="flex items-center gap-2">
          <Mail size={16}/>
          {person.email}
        </div>

        <div className="flex items-center gap-2">
          <Phone size={16}/>
          {person.phone}
        </div>

      </div>

    </div>
  )

  return (
    <section
      id="board"
      className="relative py-28 cafla-section"
    >

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}

        <div className="text-center mb-20">

          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
            CAFLA Leadership
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Meet the leadership team responsible for guiding the College
            of Referees of Los Angeles and supporting the development
            of referees across the region.
          </p>

        </div>

        {/* BOARD */}

        <div className="mb-24">

          <h3 className="text-2xl text-white font-semibold mb-10 text-center">
            Executive Board
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {board.map((p,i) => (
              <Card key={i} person={p}/>
            ))}
          </div>

        </div>


        {/* ASSIGNORS */}

        <div className="mb-24">

          <h3 className="text-2xl text-white font-semibold mb-10 text-center">
            Match Assignors
          </h3>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {assignors.map((p,i) => (
              <Card key={i} person={p}/>
            ))}
          </div>

        </div>


        {/* INSTRUCTORS */}

        <div>

          <h3 className="text-2xl text-white font-semibold mb-10 text-center">
            Referee Instructors
          </h3>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {instructors.map((p,i) => (
              <Card key={i} person={p}/>
            ))}
          </div>

        </div>

      </div>

    </section>
  )
}