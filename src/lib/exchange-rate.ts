/**
 * Exchange Rate Service
 *
 * Fuente del USD/ARS (solo display; precios del cotizador están en USD):
 *  1. Con VITE_PANEL_API_URL → GET {base}/exchange-rate (Admin = verdad)
 *  2. Sin Admin → VITE_EXCHANGE_RATE_URL (opcional, p. ej. Apps Script)
 *  3. Sin ninguna URL → Dólar Blue público (dolarapi.com)
 *
 * Si el Admin está configurado y falla: no se reutiliza una tasa vieja como actual.
 */

import { getPanelApiBaseUrl } from '@/config/tenant'

const APPS_SCRIPT_URL = String(import.meta.env.VITE_EXCHANGE_RATE_URL ?? '').trim()

/** Fallback público: cotización Blue venta (ARS por USD). */
const PUBLIC_BLUE_URL = 'https://dolarapi.com/v1/dolares/blue'

const CACHE_DURATION_MS = 60 * 1000

let cachedRate: number | null = null
let cacheTimestamp = 0
let panelFailed = false

/** True si el Admin era la fuente del dólar y la petición falló. */
export function isExchangeRateFailed(): boolean {
  return panelFailed
}

function resolveSourceUrl(): { url: string; fromPanel: boolean; publicFallback: boolean } {
  const panelBase = getPanelApiBaseUrl()
  if (panelBase) {
    return { url: `${panelBase}/exchange-rate`, fromPanel: true, publicFallback: false }
  }
  if (APPS_SCRIPT_URL) {
    return { url: APPS_SCRIPT_URL, fromPanel: false, publicFallback: false }
  }
  return { url: PUBLIC_BLUE_URL, fromPanel: false, publicFallback: true }
}

function parseRatePayload(data: unknown, publicFallback: boolean): number {
  if (!data || typeof data !== 'object') throw new Error('Invalid rate payload')
  const obj = data as Record<string, unknown>

  // Admin / Apps Script: { rate: number }
  const direct = Number(obj.rate)
  if (direct > 0) return direct

  // dolarapi.com blue: { venta: number, compra: number }
  if (publicFallback) {
    const venta = Number(obj.venta)
    if (venta > 0) return venta
  }

  throw new Error('Invalid rate')
}

/**
 * Fetch the current USD/ARS exchange rate (display only).
 * Returns null if no real rate is available.
 */
export async function fetchExchangeRate(options?: { force?: boolean }): Promise<number | null> {
  const { url: SOURCE_URL, fromPanel, publicFallback } = resolveSourceUrl()
  const force = options?.force === true

  if (
    !force &&
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
    const rate = parseRatePayload(data, publicFallback)

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
