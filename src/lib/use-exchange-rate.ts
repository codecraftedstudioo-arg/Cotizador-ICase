import { useState, useEffect } from 'react'
import { fetchExchangeRate, isExchangeRateFailed } from './exchange-rate'
import { isPanelApiConfigured } from '@/config/tenant'

const LS_KEY = 'cotizador-exchange-rate'

function getCachedRate(): number | null {
  try {
    const val = localStorage.getItem(LS_KEY)
    return val ? Number(val) : null
  } catch {
    return null
  }
}

function clearCachedRate(): void {
  try {
    localStorage.removeItem(LS_KEY)
  } catch {
    /* ignore */
  }
}

interface ExchangeRateState {
  rate: number | null
  loading: boolean
  failed: boolean
}

/**
 * Hook to fetch the USD/ARS exchange rate.
 * Con Admin configurado: no rehidrata desde localStorage (evita tasa obsoleta).
 * Si el Admin falla: limpia LS y marca failed.
 */
export function useExchangeRate(): ExchangeRateState {
  const panelMode = isPanelApiConfigured()
  const [state, setState] = useState<ExchangeRateState>({
    rate: panelMode ? null : getCachedRate(),
    loading: true,
    failed: false,
  })

  useEffect(() => {
    fetchExchangeRate().then((rate) => {
      if (rate !== null) {
        setState({ rate, loading: false, failed: false })
        try {
          localStorage.setItem(LS_KEY, String(rate))
        } catch {
          /* ignore */
        }
      } else if (isPanelApiConfigured() || isExchangeRateFailed()) {
        clearCachedRate()
        setState({ rate: null, loading: false, failed: true })
      } else {
        setState((prev) => ({ rate: prev.rate, loading: false, failed: false }))
      }
    })
  }, [])

  return state
}
