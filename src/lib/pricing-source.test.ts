import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Sin VITE_PANEL_API_URL → JSON local (no fetch a cotizador-prices).
 * Con VITE_PANEL_API_URL → Admin; si falla → isPanelPricingFailed (sin pricing.json).
 */

function mockFetch(calls: string[], impl?: (url: string) => Promise<Response>) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    calls.push(url)
    if (impl) return impl(url)
    return { ok: false, status: 500, json: async () => ({}) } as unknown as Response
  })
}

const OK_PAYLOAD = {
  models: [{ id: 1, name: 'iPhone TEST', prices: [{ storage: '128', priceUsd: 1000 }] }],
  penalties: [{ key: 'screenCracked', type: 'percentage', value: 0.5, overrides: {} }],
  canjeBonus: { type: 'percentage', value: 0.1 },
}

describe('initPricingConfig — JSON local por defecto', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('fuente estática → no consulta API externa', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', '')
    const calls: string[] = []
    vi.stubGlobal('fetch', mockFetch(calls))

    const mod = await import('./pricing-source')
    await mod.initPricingConfig()

    expect(mod.isPanelPricingFailed()).toBe(false)
    expect(calls.some((u) => u.includes('cotizador-prices'))).toBe(false)
  })

  it('sin API configurada → NO marca falla (la estática es fuente legítima)', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', '')
    vi.stubGlobal('fetch', mockFetch([]))

    const mod = await import('./pricing-source')
    await mod.initPricingConfig()

    expect(mod.isPanelPricingFailed()).toBe(false)
  })
})

describe('initPricingConfig — Admin (VITE_PANEL_API_URL)', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('consulta {base}/api/v1/cotizador-prices y aplica config', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', 'https://admin.ejemplo.com')
    const calls: string[] = []
    vi.stubGlobal(
      'fetch',
      mockFetch(calls, async () =>
        ({
          ok: true,
          status: 200,
          json: async () => OK_PAYLOAD,
        }) as unknown as Response
      )
    )

    const pricing = await import('./pricing-source')
    const engine = await import('./pricing-engine')
    await pricing.initPricingConfig()

    expect(pricing.isPanelPricingFailed()).toBe(false)
    expect(calls).toEqual(['https://admin.ejemplo.com/api/v1/cotizador-prices'])
    expect(engine.getAvailableModels()).toContain('iPhone TEST')
  })

  it('normaliza base que ya incluye /api/v1 (sin duplicar)', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', 'https://admin.ejemplo.com/api/v1/')
    const calls: string[] = []
    vi.stubGlobal(
      'fetch',
      mockFetch(calls, async () =>
        ({
          ok: true,
          status: 200,
          json: async () => OK_PAYLOAD,
        }) as unknown as Response
      )
    )

    const mod = await import('./pricing-source')
    await mod.initPricingConfig()

    expect(calls[0]).toBe('https://admin.ejemplo.com/api/v1/cotizador-prices')
  })

  it('si el Admin falla → isPanelPricingFailed (no cotiza con JSON viejo)', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', 'https://admin.ejemplo.com')
    vi.stubGlobal('fetch', mockFetch([]))

    const mod = await import('./pricing-source')
    await mod.initPricingConfig()

    expect(mod.isPanelPricingFailed()).toBe(true)
  })
})

describe('normalizePanelApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('agrega /api/v1 y quita slash final', async () => {
    const { normalizePanelApiBaseUrl } = await import('@/config/tenant')
    expect(normalizePanelApiBaseUrl('https://x.com')).toBe('https://x.com/api/v1')
    expect(normalizePanelApiBaseUrl('https://x.com/')).toBe('https://x.com/api/v1')
    expect(normalizePanelApiBaseUrl('https://x.com/api/v1')).toBe('https://x.com/api/v1')
    expect(normalizePanelApiBaseUrl('https://x.com/api/v1/')).toBe('https://x.com/api/v1')
  })
})
