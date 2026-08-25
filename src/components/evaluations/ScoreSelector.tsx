"use client"

type Option = { value: number; label: string }

type Props = {
  title: string
  value: number | null
  onChange: (value: number) => void
  options: Option[]
}

export function ScoreSelector({ title, value, onChange, options }: Props) {
  const groupName = `evaluation-${title.trim().toLowerCase().replace(/\s+/g, "-")}`

  return (
    <fieldset className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <legend className="px-1 text-sm font-semibold text-white">
        {title}<span className="ml-1 text-yellow-300" aria-hidden="true">*</span>
        <span className="sr-only"> (required)</span>
      </legend>

      <div className="mt-2 space-y-2">
        {options.map((option) => {
          const optionId = `${groupName}-${option.value}`
          const selected = value === option.value

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                selected
                  ? "border-yellow-400/40 bg-yellow-400/10 text-white"
                  : "border-transparent bg-black/10 text-gray-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-gray-200"
              }`}
            >
              <input
                id={optionId}
                name={groupName}
                type="radio"
                required
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 shrink-0 accent-yellow-400"
              />
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="font-semibold text-yellow-300">{option.value}</span>
                <span>{option.label}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
