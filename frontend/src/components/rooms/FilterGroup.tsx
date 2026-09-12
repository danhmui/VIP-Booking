export function FilterGroup({
  title,
  options,
  selectedOptions,
  onToggle,
}: {
  title: string
  options: Array<{ value: string; label: string }>
  selectedOptions: string[]
  onToggle: (option: string) => void
}) {
  return (
    <div className="grid gap-2.5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {options.map((option) => (
        <label className="inline-flex items-center gap-2 text-sm text-slate-300" key={option.value}>
          <input
            className="h-4 w-4 accent-blue-500"
            checked={selectedOptions.includes(option.value)}
            type="checkbox"
            onChange={() => onToggle(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  )
}
