type Event = {
  title: string
  date: string
  time: string
  location: string
  googleLink: string
}

export const calendarData: Record<string, Event[]> = {

  March: [
    {
      title: "Monthly Referee Meeting",
      date: "March 5",
      time: "7:30 PM",
      location: "CAFLA Headquarters",
      googleLink: "#",
    },
    {
      title: "Fitness Training",
      date: "March 12",
      time: "8:00 AM",
      location: "Montebello Sports Complex",
      googleLink: "#",
    },
    {
      title: "Laws of the Game Class",
      date: "March 19",
      time: "7:00 PM",
      location: "CAFLA Training Room",
      googleLink: "#",
    },
    {
      title: "Referee Workshop",
      date: "March 26",
      time: "7:30 PM",
      location: "CAFLA Headquarters",
      googleLink: "#",
    },
  ],

  April: [
    {
      title: "Monthly Referee Meeting",
      date: "April 2",
      time: "7:30 PM",
      location: "CAFLA Headquarters",
      googleLink: "#",
    },
    {
      title: "Fitness Training",
      date: "April 9",
      time: "8:00 AM",
      location: "Montebello Sports Complex",
      googleLink: "#",
    },
    {
      title: "VAR Awareness Class",
      date: "April 16",
      time: "7:00 PM",
      location: "CAFLA Training Room",
      googleLink: "#",
    },
    {
      title: "Field Simulation",
      date: "April 23",
      time: "7:30 PM",
      location: "CAFLA Field",
      googleLink: "#",
    },
  ],
}