import { useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { getTheme, applyTheme, STORAGE_KEY, type Theme } from './theme'

function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Origen del reveal (centro del toggle). Si no se pasa, cae en la esquina sup-der.
export interface RevealOrigin {
  x: number
  y: number
}

// Evento interno para sincronizar TODAS las instancias de useTheme en la misma
// página. El header puede montar 2 toggles (desktop + mobile): si no se
// sincronizan, togglear uno deja al otro con el estado viejo y al cambiar de
// breakpoint se ve el opuesto. El evento `storage` del navegador NO sirve para
// esto (solo dispara entre pestañas distintas, no en el mismo documento).
const THEME_EVENT = 'cotizador-theme-change'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getTheme())

  useEffect(() => {
    // Re-sincroniza al montar y ante cualquier cambio de tema: otra instancia del
    // hook en la misma página (THEME_EVENT) u otra pestaña (storage).
    const sync = () => setThemeState(getTheme())
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener(THEME_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(THEME_EVENT, sync)
    }
  }, [])

  const toggle = useCallback((_origin?: RevealOrigin) => {
    const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* no-op */
    }

    // Aplica la clase .dark + actualiza el estado de React de forma SÍNCRONA
    // (flushSync) para que todo quede en la misma "foto".
    const apply = () => {
      applyTheme(next)
      flushSync(() => setThemeState(next))
      // Notifica a las demás instancias del hook (otros toggles) para que no
      // queden desincronizadas al cambiar de breakpoint.
      window.dispatchEvent(new Event(THEME_EVENT))
    }

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> }
    }

    // Sin soporte (Firefox / iOS viejo) o reduce-motion → cambio instantáneo.
    if (!doc.startViewTransition || prefersReducedMotion()) {
      apply()
      return
    }

    // Fundido suave: la animación la maneja el CSS (::view-transition-new(root)).
    doc.startViewTransition(apply)
  }, [])

  return { theme, toggle, isDark: theme === 'dark' }
}
