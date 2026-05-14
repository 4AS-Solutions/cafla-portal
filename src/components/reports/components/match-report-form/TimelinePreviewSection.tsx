import { MatchTimeline } from "@/src/components/match/MatchTimeline";
import { Clock3 } from "lucide-react";


export function TimelinePreviewSection({ match, timelinePreview }: any) {
    return (
        <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Clock3 size={18} className="text-yellow-400" />
            Timeline Preview
        </h2>

        <div className="mb-4 flex justify-around text-sm font-bold text-white">
            <span>{match.home_team}</span>
            <span>{match.away_team}</span>
        </div>

        <MatchTimeline events={timelinePreview} />
        </section>
    )
}