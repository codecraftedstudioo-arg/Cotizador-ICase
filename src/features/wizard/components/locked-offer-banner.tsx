import { useEffect, useState } from 'react'

const TOTAL_SECONDS = 24 * 60 * 60

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function formatRemaining(secondsLeft: number) {
  const h = Math.floor(secondsLeft / 3600)
  const m = Math.floor((secondsLeft % 3600) / 60)
  const s = secondsLeft % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function LockedOfferBanner() {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS - 1)

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? TOTAL_SECONDS - 1 : prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 border border-amber-400/30"
      style={{
        background:
          'linear-gradient(135deg, rgba(251,191,36,0.10) 0%, rgba(0,0,0,0) 70%)',
        boxShadow: '0 0 0 1px rgba(251,191,36,0.05) inset',
      }}
      aria-live="polite"
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
        style={{ background: 'rgba(251,191,36,0.15)' }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="#FBBF24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-[0.18em] text-amber-400 leading-none mb-1">
          OFERTA BLOQUEADA
        </p>
        <p className="leading-none">
          <span className="text-fg font-bold text-base tabular-nums">
            {formatRemaining(remaining)}
          </span>
          <span className="text-fg-muted text-xs ml-1.5">restantes</span>
        </p>
      </div>
    </div>
  )
}
