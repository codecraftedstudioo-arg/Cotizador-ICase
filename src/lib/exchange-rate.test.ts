import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('fetchExchangeRate — Admin', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('usa {base}/api/v1/exchange-rate cuando hay VITE_PANEL_API_URL', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', 'https://admin.ejemplo.com')
    vi.stubEnv('VITE_EXCHANGE_RATE_URL', 'https://apps-script.ejemplo.com/exec')
    const calls: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        calls.push(String(input))
        return {
          ok: true,
          status: 200,
          json: async () => ({ rate: 1400 }),
        } as unknown as Response
      })
    )

    const mod = await import('./exchange-rate')
    const rate = await mod.fetchExchangeRate()

    expect(rate).toBe(1400)
    expect(calls).toEqual(['https://admin.ejemplo.com/api/v1/exchange-rate'])
    expect(mod.isExchangeRateFailed()).toBe(false)
  })

  it('si el Admin falla → null y marca failed (sin tasa vieja)', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', 'https://admin.ejemplo.com')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }) as unknown as Response)
    )

    const mod = await import('./exchange-rate')
    const rate = await mod.fetchExchangeRate()

    expect(rate).toBeNull()
    expect(mod.isExchangeRateFailed()).toBe(true)
  })

  it('sin Admin usa VITE_EXCHANGE_RATE_URL', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', '')
    vi.stubEnv('VITE_EXCHANGE_RATE_URL', 'https://apps-script.ejemplo.com/exec')
    const calls: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        calls.push(String(input))
        return {
          ok: true,
          status: 200,
          json: async () => ({ rate: 1300 }),
        } as unknown as Response
      })
    )

    const mod = await import('./exchange-rate')
    const rate = await mod.fetchExchangeRate()

    expect(rate).toBe(1300)
    expect(calls[0]).toBe('https://apps-script.ejemplo.com/exec')
  })
})
