import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Trash2 } from "lucide-react"
import PlayerSelect from "./PlayerSelect"

export function GoalRow({
  index,
  register,
  remove,
  disabled,
  isMobile,
  players,
  setValue,
  watch,
  homeTeam,
  awayTeam
}: any) {

  
    const darkSelectClass =
    "h-10 w-full rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm text-white outline-none transition focus:border-yellow-400/40 disabled:opacity-60"

    const selectedTeam = watch(
      `goals.${index}.team`
    )

    const filteredPlayers = players.filter(
      (player: any) =>
        selectedTeam === "home"
          ? player.team_name === homeTeam
          : player.team_name === awayTeam
    )  
    .sort((a: any, b: any) =>
      a.last_name.localeCompare(b.last_name)
    )

    const hasRosterPlayers = filteredPlayers.length > 0;

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
      {isMobile ? (
        <div className="flex flex-col gap-3">
          <select
            disabled={disabled}
            className={darkSelectClass}
            {...register(`goals.${index}.team`)}
          >
            <option value="home">{homeTeam}</option>
            <option value="away">{awayTeam}</option>
          </select>

          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Player Number"
            disabled={disabled}
            className="bg-[#0B0F0F]"
            {...register(`goals.${index}.player_number`)}
          />

          { hasRosterPlayers ? (
            <PlayerSelect
              players={filteredPlayers}
              disabled={disabled}
              value={watch(`goals.${index}.player_id`) || ""}
              onChange={(player) => {
                if (!player) return

                setValue(
                  `goals.${index}.player_id`,
                  player.player_id
                )

                setValue(
                  `goals.${index}.player_name`,
                  `${player.first_name} ${player.last_name}`
                )
              }}
            />
          ) : (
            <Input
              placeholder="Player"
              disabled={disabled}
              className="bg-[#0B0F0F]"
              {...register(`goals.${index}.player_name`)}
            />
          )}

          <Input
            type="number"
            min={1}
            max={90}
            placeholder="Minute"
            disabled={disabled}
            className="bg-[#0B0F0F]"
            {...register(`goals.${index}.minute`, {
              valueAsNumber: true,
              min: 1,
              max: 90,
            })}
          />

          <select
            disabled={disabled}
            className={darkSelectClass}
            {...register(`goals.${index}.goal_type`)}
          >
            <option value="normal">Goal</option>
            <option value="penalty">Penalty</option>
            <option value="own_goal">Own Goal</option>
          </select>

          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
            >
              Remove Goal
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-3 items-center">
          <select
            disabled={disabled}
            className={darkSelectClass}
            {...register(`goals.${index}.team`)}
          >
            <option value="home">{homeTeam}</option>
            <option value="away">{awayTeam}</option>
          </select>

          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="#"
            disabled={disabled}
            className="bg-[#0B0F0F]"
            {...register(`goals.${index}.player_number`)}
          />

          { hasRosterPlayers ? (
            <PlayerSelect
              players={filteredPlayers}
              disabled={disabled}
              value={watch(`goals.${index}.player_id`) || ""}
              onChange={(player) => {
                if (!player) return

                setValue(
                  `goals.${index}.player_id`,
                  player.player_id
                )

                setValue(
                  `goals.${index}.player_name`,
                  `${player.first_name} ${player.last_name}`
                )
              }}
            />
          ) : (
            <Input
              placeholder="Player"
              disabled={disabled}
              className="bg-[#0B0F0F]"
              {...register(`goals.${index}.player_name`)}
            />
          )}

          <Input
            type="number"
            min={1}
            max={90}
            placeholder="Min"
            disabled={disabled}
            className="bg-[#0B0F0F]"
            {...register(`goals.${index}.minute`, {
              valueAsNumber: true,
              min: 1,
              max: 90,
            })}
          />

          <select
            disabled={disabled}
            className={darkSelectClass}
            {...register(`goals.${index}.goal_type`)}
          >
            <option value="normal">Goal</option>
            <option value="penalty">Penalty Kick</option>
            <option value="own_goal">Own Goal</option>
          </select>

          {!disabled ? (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash2 size={16} />
            </Button>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  )
}