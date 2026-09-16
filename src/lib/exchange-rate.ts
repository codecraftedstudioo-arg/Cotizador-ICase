/**
 * Exchange Rate Service
 *
 * Fuente del USD/ARS (solo display; precios del cotizador están en USD):
 *  - Con VITE_PANEL_API_URL → GET {base}/exchange-rate (Admin = verdad)
 *  - Sin Admin → VITE_EXCHANGE_RATE_URL (opcional, p. ej. Apps Script)
 *  - Sin ninguna URL → null (la UI oculta el tipo de cambio)
 *
 * Si el Admin está configurado y falla: no se reutiliza una tasa vieja como actual.
 */

import { getPanelApiBaseUrl } from '@/config/tenant'

const APPS_SCRIPT_URL = String(import.meta.env.VITE_EXCHANGE_RATE_URL ?? '').trim()

const CACHE_DURATION_MS = 5 * 60 * 1000

let cachedRate: number | null = null
let cacheTimestamp = 0
let panelFailed = false

/** True si el Admin era la fuente del dólar y la petición falló. */
export function isExchangeRateFailed(): boolean {
  return panelFailed
}

function resolveSourceUrl(): { url: string; fromPanel: boolean } {
  const panelBase = getPanelApiBaseUrl()
  if (panelBase) {
    return { url: `${panelBase}/exchange-rate`, fromPanel: true }
  }
  return { url: APPS_SCRIPT_URL, fromPanel: false }
}

/**
 * Fetch the current USD/ARS exchange rate (display only).
 * Returns null if no real rate is available.
 */
export async function fetchExchangeRate(): Promise<number | null> {
  const { url: SOURCE_URL, fromPanel } = resolveSourceUrl()

  if (
    cachedRate !== null &&
    Date.now() - cacheTimestamp < CACHE_DURATION_MS &&
    !panelFailed
  ) {
    return cachedRate
  }

  if (!SOURCE_URL) {
    return fromPanel ? null : cachedRate
  }

  try {
    const response = await fetch(SOURCE_URL, { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    const rate = Number(data.rate)

    if (!rate || rate <= 0) throw new Error('Invalid rate')

    cachedRate = rate
    cacheTimestamp = Date.now()
    panelFailed = false
    return rate
  } catch (err) {
    if (fromPanel) {
      // Admin configurado: no devolver tasa cacheada como si fuera vigente.
      panelFailed = true
      cachedRate = null
      cacheTimestamp = 0
      console.warn('[exchange-rate] API del Admin no disponible:', err)
      return null
    }
    return cachedRate
  }
}
