"use client"

import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Send,
  Share2
} from "lucide-react"

export function Contact() {

  return (

    <section
      id="contact"
      className="relative py-28 cafla-section overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}

        <div className="text-center mb-20">

          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
            Contact CAFLA
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Interested in becoming a referee or learning more about our
            organization? Reach out to the College of Referees of Los Angeles
            and we will gladly assist you.
          </p>

        </div>


        <div className="grid lg:grid-cols-2 gap-16">

          {/* LEFT SIDE */}

          <div className="space-y-10">

            {/* CONTACT CARD */}

            <div className="cafla-card p-10 rounded-2xl">

              <h3 className="text-2xl font-semibold text-white mb-8">
                Contact Information
              </h3>

              <div className="space-y-8">

                {/* LOCATION */}

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                    <MapPin className="text-emerald-400"/>
                  </div>

                  <div>

                    <h4 className="text-white font-semibold mb-1">
                      Meeting Location
                    </h4>

                    <p className="text-gray-400">
                      Colegio de Árbitros de Futbol de Los Angeles
                    </p>

                    <p className="text-gray-400">
                      5914 E Washington Blvd
                    </p>

                    <p className="text-gray-400">
                      Commerce, California 90040
                    </p>

                  </div>

                </div>


                {/* EMAIL */}

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Mail className="text-yellow-400"/>
                  </div>

                  <div>

                    <h4 className="text-white font-semibold mb-1">
                      Email
                    </h4>

                    <p className="text-gray-400">
                      info@cafla.org
                    </p>

                    <p className="text-gray-400">
                      membership@cafla.org
                    </p>

                  </div>

                </div>


                {/* PHONE */}

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Phone className="text-blue-400"/>
                  </div>

                  <div>

                    <h4 className="text-white font-semibold mb-1">
                      Phone
                    </h4>

                    <p className="text-gray-400">
                      +1 (323) 555-0188
                    </p>

                  </div>

                </div>


                {/* SOCIAL MEDIA */}

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Share2 className="text-purple-400"/>
                  </div>

                  <div>

                    <h4 className="text-white font-semibold mb-3">
                      Social Media
                    </h4>

                    <div className="flex gap-4">

                      <a
                        href="#"
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition"
                      >
                        <Facebook size={18}/>
                      </a>

                      <a
                        href="#"
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-600 transition"
                      >
                        <Instagram size={18}/>
                      </a>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* GOOGLE MAP */}

            <div className="cafla-card rounded-2xl overflow-hidden">

              <iframe
                src="https://www.google.com/maps?q=5914+E+Washington+Blvd+Commerce+California&output=embed"
                width="100%"
                height="300"
                loading="lazy"
                className="border-0"
              />

            </div>

          </div>


          {/* CONTACT FORM */}

          <div className="cafla-card p-10 rounded-2xl">

            <h3 className="text-2xl font-semibold text-white mb-8">
              Send Us a Message
            </h3>

            <form className="space-y-6">

              <div>

                <label className="text-gray-400 text-sm">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full mt-2 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white"
                />

              </div>


              <div>

                <label className="text-gray-400 text-sm">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="you@email.com"
                  className="w-full mt-2 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white"
                />

              </div>


              <div>

                <label className="text-gray-400 text-sm">
                  Phone
                </label>

                <input
                  type="tel"
                  placeholder="(213) 555-0000"
                  className="w-full mt-2 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white"
                />

              </div>


              <div>

                <label className="text-gray-400 text-sm">
                  Message
                </label>

                <textarea
                  rows={4}
                  placeholder="Write your message..."
                  className="w-full mt-2 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white"
                />

              </div>


              <button
                className="
                w-full
                bg-yellow-400
                text-black
                font-semibold
                py-4
                rounded-lg
                hover:scale-[1.02]
                hover:bg-yellow-300
                transition
                flex
                items-center
                justify-center
                gap-2
                "
              >

                Send Message

                <Send size={18}/>

              </button>

            </form>

          </div>

        </div>

      </div>

    </section>

  )

}