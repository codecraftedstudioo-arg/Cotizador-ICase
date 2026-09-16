import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

/**
 * Card container for wizard steps
 * Dark theme - transparent, no extra background
 */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
}

export function CardHeader({ title, subtitle }: CardHeaderProps) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-bold text-fg">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-fg-muted text-sm">{subtitle}</p>
      )}
    </div>
  )
}
