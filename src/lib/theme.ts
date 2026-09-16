// Controlador de tema (light/dark) para el Cotizador.
//
// Reglas de negocio:
// - Light es la experiencia por defecto. Dark es OPCIONAL y solo se activa si el
//   usuario lo elige manualmente.
// - NUNCA se lee `prefers-color-scheme`: la preferencia del sistema operativo no
//   debe forzar el tema. El default es fijo (ver DEFAULT_THEME).
// - La elección del usuario se persiste en localStorage bajo `cotizador-theme`.
//
// El switch real entre temas lo hace la clase `.dark` en <html> (ver
// `@custom-variant dark` en index.css). Este módulo solo togglea esa clase +
// persiste + actualiza el color de la barra del navegador en mobile.

export type Theme = 'light' | 'dark'

export const STORAGE_KEY = 'cotizador-theme'

// Default cuando el usuario nunca eligió nada: LIGHT.
// Dark es opcional y solo se activa si el usuario lo guardó (mismo criterio en
// el script anti-flash de index.html). Nunca se usa prefers-color-scheme.
export const DEFAULT_THEME: Theme = 'light'

const THEME_COLOR: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#000000',
}

export function getTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* localStorage no disponible (SSR / modo privado): caemos al default */
  }
  // Intencional: no consultamos matchMedia. El default manda.
  return DEFAULT_THEME
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLOR[theme])
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* no-op: si no podemos persistir igual aplicamos el tema en memoria */
  }
  applyTheme(theme)
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}
