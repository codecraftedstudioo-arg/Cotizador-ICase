interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}

/**
 * Checkbox for functionality issues
 * User checks what DOESN'T work
 */
export function Checkbox({ label, checked, onChange, description }: CheckboxProps) {
  return (
    <label className={`
      flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all
      border ${checked ? 'border-accent bg-accent/10' : 'border-line hover:border-line-strong'}
    `}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 rounded border-line bg-transparent text-accent focus:ring-accent"
      />
      <div>
        <div className="font-medium text-fg">{label}</div>
        {description && (
          <div className="text-sm text-fg-muted">{description}</div>
        )}
      </div>
    </label>
  )
}
