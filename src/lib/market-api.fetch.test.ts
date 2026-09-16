import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('fetchMarketPrices — Admin exclusivo', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('con VITE_PANEL_API_URL solo llama market-items (no Apps Script)', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', 'https://admin.ejemplo.com')
    vi.stubEnv('VITE_MARKET_PRICES_URL', 'https://apps-script.ejemplo.com/exec')
    const calls: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        calls.push(String(input))
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: [
              {
                model: 'iPhone 16',
                color: 'Black',
                storage: '128',
                priceUsd: 750,
                stock: 1,
                photoUrl: null,
                colorHex: '#111',
              },
            ],
          }),
        } as unknown as Response
      })
    )

    const mod = await import('./market-api')
    const data = await mod.fetchMarketPrices()

    expect(calls).toEqual(['https://admin.ejemplo.com/api/v1/market-items'])
    expect(calls.some((u) => u.includes('apps-script'))).toBe(false)
    expect(data.models[0]?.name).toBe('iPhone 16')
    expect(mod.isMarketCatalogFailed()).toBe(false)
  })

  it('con Admin si falla → isMarketCatalogFailed (sin caer a JSON)', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', 'https://admin.ejemplo.com')
    vi.stubEnv('VITE_MARKET_PRICES_URL', '')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }) as unknown as Response)
    )

    const mod = await import('./market-api')
    await expect(mod.fetchMarketPrices()).rejects.toThrow()
    expect(mod.isMarketCatalogFailed()).toBe(true)
  })
})
