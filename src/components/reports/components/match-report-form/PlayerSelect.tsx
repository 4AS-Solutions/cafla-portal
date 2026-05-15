type Player = {
  player_id: string
  first_name: string
  last_name: string
  team_name: string
}

type PlayerSelectProps = {
  players: Player[]
  value?: string
  disabled?: boolean

  onChange: (player: Player | null) => void
}

export default function PlayerSelect({
  players,
  value,
  disabled,
  onChange,
}: PlayerSelectProps) {

  function handleChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const playerId = e.target.value

    const selectedPlayer =
      players.find(
        (player) => player.player_id === playerId
      ) || null

    onChange(selectedPlayer)
  }

  return (
    <select
      value={value || ""}
      onChange={handleChange}
      disabled={disabled}
      className="
        w-full rounded-xl
        border border-white/10
        bg-[#111]/80
        px-3 py-2
        text-sm text-white
        outline-none
      "
    >
      <option value="">
        Select player
      </option>

      {players.map((player) => (
        <option
          key={player.player_id}
          value={player.player_id}
        >
          {player.last_name}, {player.first_name}
        </option>
      ))}
    </select>
  )
}