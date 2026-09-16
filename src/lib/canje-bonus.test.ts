import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import {
  calculatePrice,
  setEngineConfig,
  buildConfigFromStatic,
  buildConfigFromPanel,
  getCanjeBonus,
  getDisplayedOfferPrice,
  DEFAULT_CANJE_BONUS,
} from './pricing-engine'
import pricingData from '@/config/pricing.json'
import type { WizardState, PricingConfig } from '@/features/wizard/types'

function st(overrides: Partial<WizardState> = {}): WizardState {
  return {
    currentStep: 6,
    model: 'iPhone TEST',
    storage: '128',
    screenCondition: 'perfect',
    backCondition: 'perfect',
    frameCondition: 'perfect',
    hasLiquidDamage: false,
    batteryHealth: 'good',
    originalParts: { screen: true, battery: true },
    hasOriginalBox: true,
    functionalityIssues: { faceId: false, camera: false, audio: false, charging: false },
    iCloudOff: true,
    upgradeModel: null,
    upgradeStorage: null,
    upgradeColor: null,
    upgradePrice: null,
    contactName: null,
    contactPhone: null,
    ...overrides,
  }
}

const PANEL_WITH_BONUS: Parameters<typeof buildConfigFromPanel>[0] = {
  models: [{ id: 1, name: 'iPhone TEST', prices: [{ storage: '128', priceUsd: 1000 }] }],
  penalties: [
    { key: 'screenCracked', type: 'percentage', value: 0.5, overrides: {} },
    { key: 'noOriginalBox', type: 'fixed_usd', value: 20, overrides: {} },
  ],
  // 10% descuento "solo venta" (precios = Plan Canje)
  canjeBonus: { type: 'percentage', value: 0.1 },
}

describe('canjeBonus — semántica Admin (precios = Plan Canje)', () => {
  afterEach(() => {
    setEngineConfig(buildConfigFromStatic(pricingData as unknown as PricingConfig))
  })

  it('buildConfigFromPanel conserva canjeBonus de la API', () => {
    const cfg = buildConfigFromPanel(PANEL_WITH_BONUS)
    expect(cfg.canjeBonus).toEqual({ type: 'percentage', value: 0.1 })
  })

  it('A) Admin: canje usa precio motor; sell resta canjeBonus %', () => {
    setEngineConfig(buildConfigFromPanel(PANEL_WITH_BONUS))
    const r = calculatePrice(st())
    expect(r).not.toBeNull()
    // base 1000, sin penalizaciones
    expect(r!.basePrice).toBe(1000)
    expect(r!.finalPrice).toBe(1000) // valor Plan Canje
    expect(getCanjeBonus()).toEqual({ type: 'percentage', value: 0.1 })
    expect(getDisplayedOfferPrice(r!.finalPrice, 'canje')).toBe(1000)
    expect(getDisplayedOfferPrice(r!.finalPrice, 'sell')).toBe(900) // 1000 - 10%
  })

  it('A) Admin: canjeBonus fixed_usd resta monto en sell', () => {
    setEngineConfig(
      buildConfigFromPanel({
        ...PANEL_WITH_BONUS,
        canjeBonus: { type: 'fixed_usd', value: 40 },
      })
    )
    const r = calculatePrice(st())!
    expect(getDisplayedOfferPrice(r.finalPrice, 'canje')).toBe(1000)
    expect(getDisplayedOfferPrice(r.finalPrice, 'sell')).toBe(960) // 1000 - 40
  })

  it('B) sin Admin / static: bonus 0 → sell === canje', () => {
    setEngineConfig(buildConfigFromStatic(pricingData as unknown as PricingConfig))
    expect(getCanjeBonus()).toEqual(DEFAULT_CANJE_BONUS)
    const r = calculatePrice(st({ model: 'iPhone 15 Pro', storage: '128' }))!
    expect(r.finalPrice).toBe(420)
    expect(getDisplayedOfferPrice(r.finalPrice, 'canje')).toBe(420)
    expect(getDisplayedOfferPrice(r.finalPrice, 'sell')).toBe(420)
  })

  it('penalizaciones + bonus: sell se aplica sobre finalPrice (post-penalties)', () => {
    setEngineConfig(buildConfigFromPanel(PANEL_WITH_BONUS))
    // pantalla rajada 50% → canje 500; sell 10% → 450
    const r = calculatePrice(st({ screenCondition: 'cracked' }))!
    expect(r.finalPrice).toBe(500)
    expect(getDisplayedOfferPrice(r.finalPrice, 'canje')).toBe(500)
    expect(getDisplayedOfferPrice(r.finalPrice, 'sell')).toBe(450)
  })
})

describe('canjeBonus — C) Admin falla no deja bonus de API', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('si cotizador-prices falla, no se aplica canjeBonus de API (queda default 0)', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', 'https://admin.ejemplo.com')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }) as unknown as Response)
    )

    const pricing = await import('./pricing-source')
    const engine = await import('./pricing-engine')
    await pricing.initPricingConfig()

    expect(pricing.isPanelPricingFailed()).toBe(true)
    // Nunca se llamó setEngineConfig con panel → bonus sigue en default estático
    expect(engine.getCanjeBonus()).toEqual(DEFAULT_CANJE_BONUS)
    expect(engine.getDisplayedOfferPrice(1000, 'sell')).toBe(1000)
  })
})
