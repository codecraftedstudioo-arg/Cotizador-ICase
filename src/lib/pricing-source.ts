import { useEffect, useState } from 'react'
import { setEngineConfig, buildConfigFromPanel } from './pricing-engine'
import { getPanelApiBaseUrl } from '@/config/tenant'

/**
 * Fuente de los precios/penalizaciones del cotizador.
 *
 *  - Sin VITE_PANEL_API_URL → JSON local (pricing.json), demo/fallback.
 *  - Con VITE_PANEL_API_URL → GET {base}/cotizador-prices (Admin = verdad).
 *  - Si el Admin está configurado y falla: NO se cotiza con pricing.json.
 */

let readyPromise: Promise<void> | null = null
let panelFailed = false

/** True si el Admin era la fuente configurada pero no se pudo cargar. */
export function isPanelPricingFailed(): boolean {
  return panelFailed
}

/** Inicializa la config (idempotente: solo corre una vez). */
export function initPricingConfig(): Promise<void> {
  if (readyPromise) return readyPromise

  readyPromise = (async () => {
    const panelBase = getPanelApiBaseUrl()
    if (!panelBase) return // sin Admin → queda la config estática del motor

    try {
      const url = `${panelBase}/cotizador-prices`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      // Validación de cordura: si los datos no vienen bien, no pisamos nada.
      if (
        !data ||
        !Array.isArray(data.models) ||
        data.models.length === 0 ||
        !Array.isArray(data.penalties) ||
        data.penalties.length === 0
      ) {
        throw new Error('Datos del panel inválidos')
      }

      // canjeBonus: descuento "solo venta" (precios Admin = Plan Canje).
      setEngineConfig(buildConfigFromPanel(data))
    } catch (err) {
      // Admin configurado y falló: NO usamos pricing.json (precios desactualizados).
      // Tampoco dejamos un canjeBonus de una carga previa (no hay carga parcial).
      panelFailed = true
      console.warn('[pricing] API de precios del Admin no disponible:', err)
    }
  })()

  return readyPromise
}

/** Hook: true cuando la config terminó de cargar (Admin o estático). */
export function usePricingReady(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    initPricingConfig().then(() => {
      if (alive) setReady(true)
    })
    return () => {
      alive = false
    }
  }, [])
  return ready
}
