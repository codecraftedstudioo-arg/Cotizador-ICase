import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// El wizard se bloquea en "Cargando precios…" hasta que la config (panel o fallback)
// resuelve, y App dispara fetchExchangeRate/fetchMarketPrices/initPricingConfig al
// importarse. En el test forzamos pricing listo y stubbeamos esos fetch para no
// pegarle a la red ni dejar timers de retry colgados (lo que volvía el test frágil).
vi.mock('@/lib/pricing-source', () => ({
  usePricingReady: () => true,
  isPanelPricingFailed: () => false,
  initPricingConfig: () => Promise.resolve(),
}))
vi.mock('@/lib/exchange-rate', () => ({
  fetchExchangeRate: () => Promise.resolve(1400),
  isExchangeRateFailed: () => false,
}))
vi.mock('@/lib/market-api', () => ({
  fetchMarketPrices: () => Promise.resolve({ models: [], currency: 'USD', lastUpdated: '' }),
}))
vi.mock('@/lib/use-exchange-rate', () => ({
  useExchangeRate: () => ({ rate: 1400, loading: false, failed: false }),
}))

// Import after the mocks so App's module-level effects use them.
const { default: App } = await import('./App')

describe('App', () => {
  it('renders the intro screen', () => {
    render(<App />)
    // El hero se renderiza dos veces (variante mobile + desktop), por eso getAllByText
    expect(screen.getAllByText(/Cambiá tu/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cotizar ahora').length).toBeGreaterThan(0)
  })

  it('muestra la pantalla de elección del wizard al clickear "Cotizar ahora"', async () => {
    render(<App />)
    fireEvent.click(screen.getAllByText('Cotizar ahora')[0])
    expect(await screen.findByText('¿Qué querés hacer?')).toBeInTheDocument()
  })
})
