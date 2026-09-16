import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

/**
 * Reusable Button component with variants
 * Brand colors: cyan (#9de8ef), black, white
 * Includes hover scale animation
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    font-medium rounded-xl
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transform hover:scale-[1.02] active:scale-[0.98]
  `

  const variants = {
    // CTA principal: usa el acento del tema (azul Apple en claro / verde en oscuro).
    // Disabled = gris legible (no acento pálido con texto blanco ilegible).
    primary: 'bg-accent text-accent-contrast hover:bg-accent-hover focus:ring-accent shadow-lg disabled:bg-fg/15 disabled:text-fg-muted disabled:shadow-none',
    secondary: 'bg-fg/10 text-fg hover:bg-fg/15 focus:ring-fg/40 backdrop-blur-sm disabled:opacity-50',
    outline: 'border-2 border-line-strong text-fg hover:border-fg hover:bg-fg/5 focus:ring-accent backdrop-blur-sm disabled:opacity-50',
    whatsapp: 'bg-green-500 text-white hover:bg-green-400 focus:ring-green-500 shadow-lg hover:shadow-green-500/25 disabled:bg-green-300',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg font-semibold',
  }

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'cursor-not-allowed transform-none' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
