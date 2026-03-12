"use client"

import {
  Globe,
  BookOpen,
  Users,
  Video,
  ExternalLink
} from "lucide-react"

export function Resources() {

  const organizations = [
    { name: "US Soccer Federation", link: "https://www.ussoccer.com" },
    { name: "Cal South Soccer", link: "https://calsouth.com" },
    { name: "IFAB - Laws of the Game", link: "https://www.theifab.com" },
    { name: "FIFA Refereeing", link: "https://www.fifa.com" }
  ]

  const education = [
    { name: "Laws of the Game PDF", link: "#" },
    { name: "CAFLA Training Manual", link: "#" },
    { name: "Referee Positioning Guide", link: "#" },
    { name: "Rules Quiz Platform", link: "#" }
  ]

  const community = [
    { name: "CAFLA Member Portal", link: "#" },
    { name: "Referee Community Forum", link: "#" },
    { name: "Mentorship Program", link: "#" },
    { name: "New Referee Orientation", link: "#" }
  ]

  const videos = [
    { name: "VAR Training Videos", link: "#" },
    { name: "Match Analysis Library", link: "#" },
    { name: "Professional Referee Clips", link: "#" },
    { name: "Game Management Examples", link: "#" }
  ]

  const Card = ({ title, icon: Icon, items, color }: any) => (

    <div className="cafla-card rounded-xl overflow-hidden">

      {/* HEADER */}

      <div className={`${color} flex items-center gap-3 px-6 py-4`}>

        <Icon className="text-white" size={22}/>

        <h3 className="text-white font-semibold text-lg">
          {title}
        </h3>

      </div>

      {/* LINKS */}

      <div className="divide-y divide-white/10">

        {items.map((item: any, i: number) => (

          <a
            key={i}
            href={item.link}
            target="_blank"
            className="
            flex items-center justify-between
            px-6 py-4
            text-gray-400
            hover:text-white
            hover:bg-white/5
            transition
            "
          >

            {item.name}

            <ExternalLink size={16}/>

          </a>

        ))}

      </div>

    </div>

  )

  return (

    <section
      id="resources"
      className="relative py-28 cafla-section"
    >

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}

        <div className="text-center mb-20">

          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
            Resources & Links
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Essential resources and tools for your referee development
          </p>

        </div>

        {/* GRID */}

        <div className="grid md:grid-cols-2 gap-10">

          <Card
            title="Official Organizations"
            icon={Globe}
            items={organizations}
            color="bg-emerald-600"
          />

          <Card
            title="Educational Resources"
            icon={BookOpen}
            items={education}
            color="bg-yellow-500"
          />

          <Card
            title="Community & Support"
            icon={Users}
            items={community}
            color="bg-blue-600"
          />

          <Card
            title="Video Resources"
            icon={Video}
            items={videos}
            color="bg-purple-600"
          />

        </div>

      </div>

    </section>

  )

}