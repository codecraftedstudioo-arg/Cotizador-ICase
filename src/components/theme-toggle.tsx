import { useTheme } from '@/lib/use-theme'

interface ThemeToggleProps {
  className?: string
}

/** Sol estilo iOS (slider de brillo): núcleo dorado lleno + 8 rayos cortos
 *  redondeados, separados del círculo. */
function SunIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4.6" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2.4" x2="12" y2="4.7" />
        <line x1="12" y1="19.3" x2="12" y2="21.6" />
        <line x1="2.4" y1="12" x2="4.7" y2="12" />
        <line x1="19.3" y1="12" x2="21.6" y2="12" />
        <line x1="5.45" y1="5.45" x2="7.05" y2="7.05" />
        <line x1="16.95" y1="16.95" x2="18.55" y2="18.55" />
        <line x1="5.45" y1="18.55" x2="7.05" y2="16.95" />
        <line x1="16.95" y1="7.05" x2="18.55" y2="5.45" />
      </g>
    </svg>
  )
}

/** Luna (Lucide-style): creciente lleno. */
function MoonIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Toggle de tema sol ↔ luna.
 *
 * Cápsula de vidrio: el knob se desliza izq→der y la cara cambia de SOL (modo
 * claro, ámbar) a LUNA (modo oscuro, plata) con un crossfade rotatorio (el sol
 * gira y se desvanece mientras entra la luna). Glow cálido de día / índigo de
 * noche detrás del knob. El cambio de tema dispara el fundido de página
 * (View Transitions, ver use-theme).
 *
 * <button role="switch"> accesible por teclado y lectores de pantalla.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={() => toggle()}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={[
        'group relative inline-flex h-8 w-[58px] shrink-0 items-center rounded-full p-1',
        'cursor-pointer border backdrop-blur-md transition-colors duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        isDark ? 'border-white/15 bg-white/[0.06]' : 'border-black/10 bg-black/[0.04]',
        className,
      ].join(' ')}
    >
      {/* Glow detrás del knob: cálido de día / índigo de noche */}
      <span
        aria-hidden
        className={`pointer-events-none absolute left-1 top-1 h-6 w-6 rounded-full blur-md transition-all duration-500 ${
          isDark ? 'translate-x-[26px] bg-indigo-400/30' : 'translate-x-0 bg-amber-300/45'
        }`}
      />

      {/* Knob deslizante con sol/luna que se cruzan */}
      <span
        className={[
          'relative z-10 grid h-6 w-6 place-items-center overflow-hidden rounded-full ring-1',
          'shadow-[0_2px_6px_rgba(0,0,0,0.25)]',
          'transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
          isDark
            ? 'translate-x-[26px] bg-gradient-to-br from-[#363b4f] to-[#1b1e2a] ring-white/20'
            : 'translate-x-0 bg-white ring-black/5',
        ].join(' ')}
      >
        {/* Sol (visible en claro) — dorado estilo iOS */}
        <SunIcon
          className={`absolute h-4 w-4 text-[#FFB300] transition-all duration-500 ${
            isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        {/* Luna (visible en oscuro) */}
        <MoonIcon
          className={`absolute h-[14px] w-[14px] text-[#dfe3f2] transition-all duration-500 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
          }`}
        />
      </span>
    </button>
  )
}
