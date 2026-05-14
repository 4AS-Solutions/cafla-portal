import { useEffect } from "react"

type UseAutoSecondYellowProps = {
  watchedCards: any[]
  form: any
}

export function useAutoSecondYellow({
  watchedCards,
  form,
}: UseAutoSecondYellowProps) {
  useEffect(() => {
    if (!watchedCards) return

    const currentCards = watchedCards || []

    const manualCards = currentCards.filter(
      (c) => !c.auto_generated
    )

    const existingAutoCards = currentCards.filter(
      (c) => c.auto_generated
    )

    const yellowGroups: Record<string, any[]> = {}

    manualCards.forEach((c, manualIndex) => {
      if (!c.player_number) return

      const minute = Number(c.minute)

      if (
        c.card_type === "yellow" &&
        c.minute !== undefined &&
        c.minute !== null &&
        !isNaN(minute) &&
        minute >= 1 &&
        minute <= 90
      ) {
        const key = `${c.team}-${c.player_number}`

        if (!yellowGroups[key]) {
          yellowGroups[key] = []
        }

        yellowGroups[key].push({
          ...c,
          manualIndex,
          minute: Number(c.minute),
        })
      }
    })

    const secondYellowIndexByPlayer: Record<string, number> = {}

    Object.entries(yellowGroups).forEach(([key, yellows]) => {
      const sortedYellows = [...yellows].sort((a, b) => {
        if (a.minute !== b.minute) {
          return a.minute - b.minute
        }

        return a.manualIndex - b.manualIndex
      })

      if (sortedYellows.length >= 2) {
        secondYellowIndexByPlayer[key] =
          sortedYellows[1].manualIndex
      }
    })

    const yellowCountByPlayer: Record<string, number> = {}

    const nextCards: any[] = []

    manualCards.forEach((card, manualIndex) => {
      const key = `${card.team}-${card.player_number}`

      if (card.card_type === "yellow" && card.player_number) {
        if (!yellowCountByPlayer[key]) {
          yellowCountByPlayer[key] = 0
        }

        // 🚫 prevent third yellow
        if (yellowCountByPlayer[key] >= 2) {
          return
        }

        yellowCountByPlayer[key]++
      }

      const cleanCard = {
        ...card,
        auto_generated: false,
      }

      nextCards.push(cleanCard)

      const isSecondYellow =
        card.card_type === "yellow" &&
        card.player_number &&
        secondYellowIndexByPlayer[key] === manualIndex

      if (isSecondYellow) {
        const hasManualRed = manualCards.some(
          (c) =>
            c.card_type === "red" &&
            !c.auto_generated &&
            c.team === card.team &&
            c.player_number === card.player_number
        )

        if (!hasManualRed) {
          const existingAuto = existingAutoCards.find(
            (c) =>
              c.card_type === "red" &&
              c.reason_code === "2CT" &&
              c.team === card.team &&
              c.player_number === card.player_number
          )

          nextCards.push({
            team: card.team,
            player_name: card.player_name,
            player_number: card.player_number,
            minute: Number(card.minute),
            card_type: "red",
            reason_code: "2CT",
            notes: existingAuto?.notes || "",
            auto_generated: true,
          })
        }
      }
    })

    const currentSerialized = JSON.stringify(currentCards)

    const nextSerialized = JSON.stringify(nextCards)

    if (currentSerialized !== nextSerialized) {
      form.setValue("cards", nextCards, {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      })
    }
  }, [watchedCards, form])
}