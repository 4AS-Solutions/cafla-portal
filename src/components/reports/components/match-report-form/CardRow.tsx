import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"

import { Trash2 } from "lucide-react"
import {
  type ChangeEvent,
  useEffect,
  useRef,
} from "react"
import PlayerSelect from "./PlayerSelect"
import { sanitizeMinute, sanitizePlayerName, sanitizePlayerNumber } from "@/src/lib/utils/match-report-inputs"

export function CardRow({
  index,
  register,
  remove,
  disabled,
  reasons,
  watch,
  setValue,
  isMobile,
  players,
  homeTeam,
  awayTeam,
}: any) {
  const darkSelectClass =
    "h-10 w-full rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm text-white outline-none transition focus:border-yellow-400/40 disabled:opacity-60"

  const selectedTeam = watch(`cards.${index}.team`)

  const filteredPlayers = players
    .filter((player: any) =>
      selectedTeam === "home"
        ? player.team_name === homeTeam
        : player.team_name === awayTeam
    )
    .sort((a: any, b: any) =>
      a.last_name.localeCompare(b.last_name)
    )

  const card = watch(`cards.${index}`) || {}

  const cardType = card.card_type
  const reasonCode = card.reason_code
  const isAuto = card.auto_generated === true

  const isLocked = disabled || isAuto

  const filteredReasons = (reasons || []).filter(
    (reason: any) => reason.card_type === cardType
  )

  const selectedReason = (reasons || []).find(
    (reason: any) => reason.code === reasonCode
  )

  const prevTypeRef = useRef(cardType)

  useEffect(() => {
    if (prevTypeRef.current !== cardType) {
      prevTypeRef.current = cardType

      if (!isAuto) {
        setValue(`cards.${index}.reason_code`, "")
      }
    }
  }, [cardType, isAuto, index, setValue])

  useEffect(() => {
    if (
      isAuto &&
      cardType === "red" &&
      reasonCode !== "2CT"
    ) {
      setValue(`cards.${index}.reason_code`, "2CT", {
        shouldDirty: false,
      })
    }
  }, [
    isAuto,
    cardType,
    reasonCode,
    index,
    setValue,
  ])

  const isRed = cardType === "red"
  const hasRosterPlayers = filteredPlayers.length > 0

  /*
   * React Hook Form registrations
   *
   * We preserve React Hook Form's original onChange handlers
   * and call them after sanitizing each value.
   */
  const playerNumberRegistration = register(
    `cards.${index}.player_number`
  )

  const playerNameRegistration = register(
    `cards.${index}.player_name`
  )

  const minuteRegistration = register(
    `cards.${index}.minute`
  )

  const handlePlayerNumberChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    event.target.value = sanitizePlayerNumber(
      event.target.value
    )

    playerNumberRegistration.onChange(event)
  }

  const handlePlayerNameChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    event.target.value = sanitizePlayerName(
      event.target.value
    )

    playerNameRegistration.onChange(event)
  }

  const handleMinuteChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    event.target.value = sanitizeMinute(
      event.target.value
    )

    minuteRegistration.onChange(event)
  }

  const handlePlayerSelect = (player: any) => {
    if (!player) return

    setValue(
      `cards.${index}.player_id`,
      player.player_id
    )

    setValue(
      `cards.${index}.player_name`,
      `${player.first_name} ${player.last_name}`
    )
  }

  const reasonLabel = selectedReason
    ? `${selectedReason.code} - ${selectedReason.label}`
    : reasonCode === "2CT"
      ? "2CT - Second Caution"
      : "-"

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/30 p-4">
      {isMobile ? (
        <div className="flex flex-col gap-3">
          {/* TEAM */}
          <select
            disabled={isLocked}
            className={darkSelectClass}
            {...register(`cards.${index}.team`)}
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
            disabled={isLocked}
            className="bg-[#0B0F0F]"
            {...playerNumberRegistration}
            onChange={handlePlayerNumberChange}
          />

          {/* PLAYER */}
          {hasRosterPlayers ? (
            <PlayerSelect
              players={filteredPlayers}
              disabled={isLocked}
              value={
                watch(`cards.${index}.player_id`) || ""
              }
              onChange={handlePlayerSelect}
            />
          ) : (
            <Input
              type="text"
              maxLength={60}
              autoComplete="off"
              placeholder="Player"
              disabled={isLocked}
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
            placeholder="Minute"
            disabled={isLocked}
            className="bg-[#0B0F0F]"
            {...minuteRegistration}
            onChange={handleMinuteChange}
          />

          {/* CARD TYPE */}
          <select
            disabled={isLocked}
            className={darkSelectClass}
            {...register(`cards.${index}.card_type`)}
          >
            <option value="yellow">
              Yellow Card
            </option>

            <option value="red">
              Red Card
            </option>
          </select>

          {/* REASON */}
          {isLocked ? (
            <div className="flex h-10 items-center rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm text-gray-300">
              {reasonLabel}
            </div>
          ) : (
            <select
              className={darkSelectClass}
              {...register(
                `cards.${index}.reason_code`
              )}
            >
              <option value="">
                Select Reason
              </option>

              {filteredReasons.map((reason: any) => (
                <option
                  key={reason.code}
                  value={reason.code}
                >
                  {reason.code} - {reason.label}
                </option>
              ))}
            </select>
          )}

          {/* REMOVE */}
          {!isLocked && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
            >
              Remove Card
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-7 items-center gap-3">
          {/* TEAM */}
          <select
            disabled={isLocked}
            className={darkSelectClass}
            {...register(`cards.${index}.team`)}
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
            disabled={isLocked}
            className="bg-[#0B0F0F]"
            {...playerNumberRegistration}
            onChange={handlePlayerNumberChange}
          />

          {/* PLAYER */}
          {hasRosterPlayers ? (
            <PlayerSelect
              players={filteredPlayers}
              disabled={isLocked}
              value={
                watch(`cards.${index}.player_id`) || ""
              }
              onChange={handlePlayerSelect}
            />
          ) : (
            <Input
              type="text"
              maxLength={60}
              autoComplete="off"
              placeholder="Player"
              disabled={isLocked}
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
            placeholder="Min"
            disabled={isLocked}
            className="bg-[#0B0F0F]"
            {...minuteRegistration}
            onChange={handleMinuteChange}
          />

          {/* CARD TYPE */}
          <select
            disabled={isLocked}
            className={darkSelectClass}
            {...register(`cards.${index}.card_type`)}
          >
            <option value="yellow">
              Yellow
            </option>

            <option value="red">
              Red
            </option>
          </select>

          {/* REASON */}
          {isLocked ? (
            <div className="flex h-10 items-center rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm text-gray-300">
              {reasonLabel}
            </div>
          ) : (
            <select
              className={darkSelectClass}
              {...register(
                `cards.${index}.reason_code`
              )}
            >
              <option value="">
                Select
              </option>

              {filteredReasons.map((reason: any) => (
                <option
                  key={reason.code}
                  value={reason.code}
                >
                  {reason.code} - {reason.label}
                </option>
              ))}
            </select>
          )}

          {/* REMOVE */}
          {!isLocked ? (
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

      {/* RED CARD NOTES */}
      {isRed && !disabled && (
        <div className="space-y-2">
          {isAuto && (
            <p className="text-xs text-yellow-400">
              This red card was generated from two
              cautions. Please describe both caution
              incidents.
            </p>
          )}

          <Textarea
            placeholder={
              isAuto
                ? "Explain the first and second caution that led to the send-off..."
                : "Describe the reason for the red card..."
            }
            className="border border-red-500/20 bg-[#0B0F0F] text-sm"
            {...register(`cards.${index}.notes`)}
          />
        </div>
      )}
    </div>
  )
}