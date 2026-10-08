import { useState, useEffect } from 'react'
import { fetchExchangeRate, isExchangeRateFailed } from './exchange-rate'
import { isPanelApiConfigured } from '@/config/tenant'

const LS_KEY = 'cotizador-exchange-rate'
/** Refresco en vivo de la cotización mostrada en el teléfono. */
const POLL_INTERVAL_MS = 60 * 1000

function getCachedRate(): number | null {
  try {
    const val = localStorage.getItem(LS_KEY)
    return val ? Number(val) : null
  } catch {
    return null
  }
}

function getCachedUpdatedAt(): number | null {
  try {
    const val = localStorage.getItem(`${LS_KEY}-updated-at`)
    return val ? Number(val) : null
  } catch {
    return null
  }
}

function clearCachedRate(): void {
  try {
    localStorage.removeItem(LS_KEY)
    localStorage.removeItem(`${LS_KEY}-updated-at`)
  } catch {
    /* ignore */
  }
}

function persistRate(rate: number, updatedAt: number): void {
  try {
    localStorage.setItem(LS_KEY, String(rate))
    localStorage.setItem(`${LS_KEY}-updated-at`, String(updatedAt))
  } catch {
    /* ignore */
  }
}

interface ExchangeRateState {
  rate: number | null
  /** Epoch ms de la última cotización exitosa. */
  updatedAt: number | null
  loading: boolean
  failed: boolean
}

/**
 * Hook to fetch the USD/ARS exchange rate and keep it fresh.
 * Con Admin configurado: no rehidrata desde localStorage (evita tasa obsoleta).
 * Si el Admin falla: limpia LS y marca failed.
 * Sin Admin: usa cache local y refresca cada minuto (Dólar Blue real).
 */
export function useExchangeRate(): ExchangeRateState {
  const panelMode = isPanelApiConfigured()
  const [state, setState] = useState<ExchangeRateState>({
    rate: panelMode ? null : getCachedRate(),
    updatedAt: panelMode ? null : getCachedUpdatedAt(),
    loading: true,
    failed: false,
  })

  useEffect(() => {
    let cancelled = false

    const load = async (force: boolean) => {
      const rate = await fetchExchangeRate({ force })
      if (cancelled) return

      if (rate !== null) {
        const updatedAt = Date.now()
        setState({ rate, updatedAt, loading: false, failed: false })
        persistRate(rate, updatedAt)
      } else if (isPanelApiConfigured() || isExchangeRateFailed()) {
        clearCachedRate()
        setState({ rate: null, updatedAt: null, loading: false, failed: true })
      } else {
        setState((prev) => ({
          rate: prev.rate,
          updatedAt: prev.updatedAt,
          loading: false,
          failed: false,
        }))
      }
    }

    void load(false)
    const id = window.setInterval(() => {
      void load(true)
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return state
}
