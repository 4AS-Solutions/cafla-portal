import { Button } from "@/src/components/ui/button"
import { Plus, RectangleVertical } from "lucide-react"
import { CardRow } from "./CardRow"

type CardsSectionProps = {
  cardsArray: any
  register: any
  isReadOnly: boolean
  reasons: any[]
  loadingReasons: boolean
  watch: any
  setValue: any
  isMobile: boolean
  players: any[]
  homeTeam: string
  awayTeam: string
}

export function CardsSection({
cardsArray,
register,
isReadOnly,
reasons,
loadingReasons,
watch,
setValue,
isMobile,
players,
homeTeam,
awayTeam
}: CardsSectionProps) { 
    return (
        <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <RectangleVertical size={18} className="text-yellow-400" />
              Cards
            </h2>

            {!isReadOnly && (
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
                disabled={loadingReasons}
                onClick={() =>
                  cardsArray.prepend({
                    team: "home",
                    player_name: "",
                    player_number: "",
                    minute: 0,
                    card_type: "yellow",
                    reason_code: "UB",
                    notes: "",
                    auto_generated: false
                  })
                }
              >
                <Plus size={16} />
                {loadingReasons
                  ? "Loading..."
                  : "Add Card"}
              </Button>
            )}
          </div>

          {cardsArray.fields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-gray-500">
              No cards added.
            </div>
          ) : (
            <div className="space-y-2">
              {cardsArray.fields.map((field: any, index: number) => (
                <CardRow
                    key={field.id}
                    index={index}
                    register={register}
                    remove={cardsArray.remove}
                    disabled={isReadOnly}
                    reasons={reasons}
                    watch={watch}
                    setValue={setValue}
                    isMobile={isMobile}
                    players={players}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                />
                ))}
            </div>
          )}
        </section>
    )
}
