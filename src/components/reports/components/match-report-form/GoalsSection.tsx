import { Button } from "@/src/components/ui/button"
import { Plus, Goal } from "lucide-react"
import { GoalRow } from "./GoalRow"



type GoalsSectionProps = {
  goalsArray: any
  register: any
  isReadOnly: boolean
  isMobile: boolean
  players: any[],
  setValue: any,
  watch: any,
  homeTeam: string,
  awayTeam: string
}

export function GoalsSection({
  goalsArray,
  register,
  isReadOnly,
  isMobile,
  players,
  setValue,
  watch,
  homeTeam,
  awayTeam
}: GoalsSectionProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Goal size={18} className="text-yellow-400" />
          Goals
        </h2>

        {!isReadOnly && (
          <Button
            type="button"
            variant="ghost"
            className="gap-2 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
            onClick={() =>
              goalsArray.prepend({
                team: "home",
                player_name: "",
                player_number: "",
                minute: 0,
                half: "first",
                goal_type: "normal",
              })
            }
          >
            <Plus size={16} />
            Add Goal
          </Button>
        )}
      </div>

      {goalsArray.fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-gray-500">
          No goals added.
        </div>
      ) : (
        <div className="space-y-2">
          {goalsArray.fields.map((field: any, index: number) => (
            <GoalRow
              key={field.id}
              index={index}
              register={register}
              remove={goalsArray.remove}
              disabled={isReadOnly}
              isMobile={isMobile}
              players={players}
              setValue={setValue}
              watch={watch}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          ))}
        </div>
      )}
    </section>
  )
}