import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

import { Trash2 } from "lucide-react"
import type { ChangeEvent } from "react"
import PlayerSelect from "./PlayerSelect"
import { sanitizeMinute, sanitizePlayerName, sanitizePlayerNumber } from "@/src/lib/utils/match-report-inputs"

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
  awayTeam,
}: any) {
  const darkSelectClass =
    "h-10 w-full rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm text-white outline-none transition focus:border-yellow-400/40 disabled:opacity-60"

  const selectedTeam = watch(`goals.${index}.team`)

  const filteredPlayers = players
    .filter((player: any) =>
      selectedTeam === "home"
        ? player.team_name === homeTeam
        : player.team_name === awayTeam
    )
    .sort((a: any, b: any) => {
        const last = a.last_name.localeCompare(b.last_name)
        if (last !== 0) return last
        return a.first_name.localeCompare(b.first_name)
    })

  const hasRosterPlayers = filteredPlayers.length > 0

  /*
   * Registrations
   *
   * We preserve React Hook Form's original onChange handlers
   * and call them after sanitizing each value.
   */
  const playerNumberRegistration = register(
    `goals.${index}.player_number`
  )

  const playerNameRegistration = register(
    `goals.${index}.player_name`
  )

  const minuteRegistration = register(
    `goals.${index}.minute`
  )

  const handlePlayerNumberChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    event.target.value = sanitizePlayerNumber(event.target.value)
    playerNumberRegistration.onChange(event)
  }

  const handlePlayerNameChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    event.target.value = sanitizePlayerName(event.target.value)
    playerNameRegistration.onChange(event)
  }

  const handleMinuteChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    event.target.value = sanitizeMinute(event.target.value)
    minuteRegistration.onChange(event)
  }

  const handlePlayerSelect = (player: any) => {
    if (!player) return

    setValue(
      `goals.${index}.player_id`,
      player.player_id
    )

    setValue(
      `goals.${index}.player_name`,
      `${player.first_name} ${player.last_name}`
    )
  }

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/30 p-4">
      {isMobile ? (
        <div className="flex flex-col gap-3">
          {/* TEAM */}
          <select
            disabled={disabled}
            className={darkSelectClass}
            {...register(`goals.${index}.team`)}
          >
            <option value="home">{homeTeam}</option>
            <option value="away">{awayTeam}</option>
          </select>

          {/* PLAYER NUMBER */}
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            placeholder="Player Number"
            disabled={disabled}
            className="bg-[#0B0F0F]"
            {...playerNumberRegistration}
            onChange={handlePlayerNumberChange}
          />

          {/* PLAYER */}
          {hasRosterPlayers ? (
            <PlayerSelect
              players={filteredPlayers}
              disabled={disabled}
              value={watch(`goals.${index}.player_id`) || ""}
              onChange={handlePlayerSelect}
            />
          ) : (
            <Input
              type="text"
              maxLength={60}
              autoComplete="off"
              placeholder="Player"
              disabled={disabled}
              className="bg-[#0B0F0F]"
              {...playerNameRegistration}
              onChange={handlePlayerNameChange}
            />
          )}

          {/* MINUTE */}
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            min={1}
            placeholder="Minute"
            disabled={disabled}
            className="bg-[#0B0F0F]"
            {...minuteRegistration}
            onChange={handleMinuteChange}
          />

          {/* GOAL TYPE */}
          <select
            disabled={disabled}
            className={darkSelectClass}
            {...register(`goals.${index}.goal_type`)}
          >
            <option value="normal">Goal</option>
            <option value="penalty">Penalty</option>
          </select>

          {/* REMOVE */}
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
        <div className="grid grid-cols-6 items-center gap-3">
          {/* TEAM */}
          <select
            disabled={disabled}
            className={darkSelectClass}
            {...register(`goals.${index}.team`)}
          >
            <option value="home">{homeTeam}</option>
            <option value="away">{awayTeam}</option>
          </select>

          {/* PLAYER NUMBER */}
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            placeholder="#"
            disabled={disabled}
            className="bg-[#0B0F0F]"
            {...playerNumberRegistration}
            onChange={handlePlayerNumberChange}
          />

          {/* PLAYER */}
          {hasRosterPlayers ? (
            <PlayerSelect
              players={filteredPlayers}
              disabled={disabled}
              value={watch(`goals.${index}.player_id`) || ""}
              onChange={handlePlayerSelect}
            />
          ) : (
            <Input
              type="text"
              maxLength={60}
              autoComplete="off"
              placeholder="Player"
              disabled={disabled}
              className="bg-[#0B0F0F]"
              {...playerNameRegistration}
              onChange={handlePlayerNameChange}
            />
          )}

          {/* MINUTE */}
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            maxLength={2}
            placeholder="Min"
            disabled={disabled}
            className="bg-[#0B0F0F]"
            {...minuteRegistration}
            onChange={handleMinuteChange}
          />

          {/* GOAL TYPE */}
          <select
            disabled={disabled}
            className={darkSelectClass}
            {...register(`goals.${index}.goal_type`)}
          >
            <option value="normal">Goal</option>
            <option value="penalty">Penalty Kick</option>
          </select>

          {/* REMOVE */}
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