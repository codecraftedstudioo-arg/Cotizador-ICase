import { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  placeholder?: string
  options: Option[]
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * Custom dropdown select - Kavak style
 * Closed by default, opens on click
 */
export function Select({
  label,
  placeholder = 'Seleccionar...',
  options,
  value,
  onChange,
  disabled = false
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div ref={ref} className="relative">
      {/* Label */}
      {label && <label className="block text-sm text-fg font-medium mb-1.5">{label}</label>}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-xl text-left
          flex items-center justify-between
          border transition-all duration-200
          ${disabled
            ? 'bg-bg-subtle dark:bg-gray-800/50 border-line text-fg-subtle cursor-not-allowed'
            : isOpen
              ? 'bg-surface dark:bg-gray-800 border-accent text-fg'
              : 'bg-surface dark:bg-gray-800/80 border-line dark:border-gray-600 text-fg hover:border-line-strong'
          }
        `}
      >
        <span className={selectedOption ? 'text-fg' : 'text-fg-subtle'}>
          {selectedOption?.label || placeholder}
        </span>

        {/* Chevron */}
        <svg
          className={`w-5 h-5 text-fg-subtle transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 py-2 bg-surface dark:bg-gray-800 border border-line dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`
                w-full px-4 py-2.5 text-left transition-colors
                ${option.value === value
                  ? 'bg-accent/15 text-fg font-medium'
                  : 'text-fg hover:bg-fg/5 dark:hover:bg-gray-700'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
