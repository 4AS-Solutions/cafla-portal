"use client";

import Link from "next/link";

import { ShieldAlert, LogIn } from "lucide-react";

export default function UnauthorizedAccess() {
    return (
        <div
            className="
      min-h-screen

      flex items-center justify-center

      px-6

      bg-[#050808]
      "
        >
            {/* CARD */}
            <div
                className="
        relative

        w-full
        max-w-md

        overflow-hidden

        rounded-3xl

        border border-yellow-500/20

        bg-[#0B0F0F]/90

        backdrop-blur-xl

        shadow-2xl shadow-black/60

        p-8
        "
            >
                {/* GLOW */}
                <div
                    className="
          absolute
          inset-0

          bg-gradient-to-br
          from-yellow-500/5
          via-transparent
          to-emerald-500/5

          pointer-events-none
          "
                />

                {/* CONTENT */}
                <div className="relative z-10">
                    {/* ICON */}
                    <div
                        className="
            w-16 h-16

            rounded-2xl

            flex items-center justify-center

            bg-yellow-500/10

            border border-yellow-500/20

            mb-6
            "
                    >
                        <ShieldAlert size={30} className="text-yellow-400" />
                    </div>

                    {/* TITLE */}
                    <h1
                        className="
            text-2xl
            font-bold
            text-white
            "
                    >
                        Session Required
                    </h1>

                    {/* DESCRIPTION */}
                    <p
                        className="
            mt-3

            text-sm
            leading-relaxed

            text-gray-400
            "
                    >
                        Your session may have expired or you are not authenticated. Please
                        sign in again to continue using the CAFLA Portal.
                    </p>

                    {/* ACTION */}
                    <Link
                        href="/login"
                        className="
            mt-8

            inline-flex
            items-center
            justify-center
            gap-2

            w-full
            h-12

            rounded-2xl

            bg-gradient-to-r
            from-yellow-500/90
            to-yellow-400

            text-black
            text-sm
            font-semibold

            transition-all
            duration-200

            hover:scale-[1.01]
            hover:shadow-lg
            hover:shadow-yellow-500/20
            "
                    >
                        <LogIn size={16} />
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
