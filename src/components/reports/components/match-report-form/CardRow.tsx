import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Trash2 } from "lucide-react"
import { useEffect, useRef } from "react"


export function CardRow({
  index,
  register,
  remove,
  disabled,
  reasons,
  watch,
  setValue,
  isMobile
}: any) {

    const darkSelectClass =
    "h-10 w-full rounded-md border border-white/10 bg-[#0B0F0F] px-3 text-sm text-white outline-none transition focus:border-yellow-400/40 disabled:opacity-60"


  const card = watch(`cards.${index}`) || {}

  const cardType = card.card_type
  const reasonCode = card.reason_code
  const isAuto = card.auto_generated === true

  const isLocked = disabled || isAuto

  const filteredReasons = (reasons || []).filter(
    (r: any) => r.card_type === cardType
  )

  const selectedReason = (reasons || []).find(
    (r: any) => r.code === reasonCode
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
    if (isAuto && cardType === "red" && reasonCode !== "2CT") {
      setValue(`cards.${index}.reason_code`, "2CT", {
        shouldDirty: false,
      })
    }
  }, [isAuto, cardType, reasonCode, index, setValue])

  const isRed = cardType === "red"

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
      {isMobile ? (
        <div className="flex flex-col gap-3">
          <select
            disabled={isLocked}
            className={darkSelectClass}
            {...register(`cards.${index}.team`)}
          >
            <option value="home">Home</option>
            <option value="away">Away</option>
          </select>

          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Player Number"
            disabled={isLocked}
            className="bg-[#0B0F0F]"
            {...register(`cards.${index}.player_number`)}
          />

          <Input
            placeholder="Player Name"
            disabled={isLocked}
            className="bg-[#0B0F0F]"
            {...register(`cards.${index}.player_name`)}
          />

          <Input
            type="number"
            min={1}
            max={90}
            placeholder="Minute"
            disabled={isLocked}
            className="bg-[#0B0F0F]"
            {...register(`cards.${index}.minute`, {
              valueAsNumber: true,
              min: 1,
              max: 90,
            })}
          />

          <select
            disabled={isLocked}
            className={darkSelectClass}
            {...register(`cards.${index}.card_type`)}
          >
            <option value="yellow">Yellow Card</option>
            <option value="red">Red Card</option>
          </select>

          {isLocked ? (
            <div className="h-10 flex items-center px-3 rounded-md border border-white/10 bg-[#0B0F0F] text-sm text-gray-300">
              {selectedReason
                ? `${selectedReason.code} - ${selectedReason.label}`
                : reasonCode === "2CT"
                ? "2CT - Second Caution"
                : "-"}
            </div>
          ) : (
            <select
              className={darkSelectClass}
              {...register(`cards.${index}.reason_code`)}
            >
              <option value="">Select Reason</option>

              {filteredReasons.map((r: any) => (
                <option key={r.code} value={r.code}>
                  {r.code} - {r.label}
                </option>
              ))}
            </select>
          )}

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
        <div className="grid grid-cols-7 gap-3 items-center">
          <select
            disabled={isLocked}
            className={darkSelectClass}
            {...register(`cards.${index}.team`)}
          >
            <option value="home">Home</option>
            <option value="away">Away</option>
          </select>

          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="#"
            disabled={isLocked}
            className="bg-[#0B0F0F]"
            {...register(`cards.${index}.player_number`)}
          />

          <Input
            placeholder="Player"
            disabled={isLocked}
            className="bg-[#0B0F0F]"
            {...register(`cards.${index}.player_name`)}
          />

          <Input
            type="number"
            min={1}
            max={90}
            placeholder="Min"
            disabled={isLocked}
            className="bg-[#0B0F0F]"
            {...register(`cards.${index}.minute`, {
              valueAsNumber: true,
              min: 1,
              max: 90,
            })}
          />

          <select
            disabled={isLocked}
            className={darkSelectClass}
            {...register(`cards.${index}.card_type`)}
          >
            <option value="yellow">Yellow</option>
            <option value="red">Red</option>
          </select>

          {isLocked ? (
            <div className="h-10 flex items-center px-3 rounded-md border border-white/10 bg-[#0B0F0F] text-sm text-gray-300">
              {selectedReason
                ? `${selectedReason.code} - ${selectedReason.label}`
                : reasonCode === "2CT"
                ? "2CT - Second Caution"
                : "-"}
            </div>
          ) : (
            <select
              className={darkSelectClass}
              {...register(`cards.${index}.reason_code`)}
            >
              <option value="">Select</option>

              {filteredReasons.map((r: any) => (
                <option key={r.code} value={r.code}>
                  {r.code} - {r.label}
                </option>
              ))}
            </select>
          )}

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

      {isRed && !disabled && (
        <div className="space-y-2">
          {isAuto && (
            <p className="text-xs text-yellow-400">
              This red card was generated from two cautions. Please describe both caution incidents.
            </p>
          )}

          <Textarea
            placeholder={
              isAuto
                ? "Explain the first and second caution that led to the send-off..."
                : "Describe the reason for the red card..."
            }
            className="bg-[#0B0F0F] border border-red-500/20 text-sm"
            {...register(`cards.${index}.notes`)}
          />
        </div>
      )}
    </div>
  )
}