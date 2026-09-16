import { describe, it, expect, afterEach } from 'vitest'
import {
  calculatePrice,
  setEngineConfig,
  buildConfigFromStatic,
  buildConfigFromPanel,
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

// Data de panel de prueba: 2 modelos a USD 1000, con features nuevas.
const PANEL_DATA: Parameters<typeof buildConfigFromPanel>[0] = {
  models: [
    { id: 1, name: 'iPhone TEST', prices: [{ storage: '128', priceUsd: 1000 }] },
    { id: 2, name: 'iPhone OTHER', prices: [{ storage: '128', priceUsd: 1000 }] },
  ],
  penalties: [
    // Pantalla rajada: 50% global, pero iPhone TEST (id 1) override a 40%
    {
      key: 'screenCracked',
      type: 'percentage',
      value: 0.5,
      overrides: { '1': { type: 'percentage', value: 0.4 } },
    },
    // Audio: USD 15 fijo (no %)
    { key: 'audioNotWorking', type: 'fixed_usd', value: 15, overrides: {} },
    { key: 'noOriginalBox', type: 'fixed_usd', value: 20, overrides: {} },
  ],
  canjeBonus: { type: 'percentage', value: 0 },
}

describe('Panel config — features nuevas', () => {
  // Después de cada test, restaurar la config estática (no contaminar).
  afterEach(() => {
    setEngineConfig(buildConfigFromStatic(pricingData as unknown as PricingConfig))
  })

  it('buildConfigFromPanel aplana precios y mapea overrides por NOMBRE de modelo', () => {
    const cfg = buildConfigFromPanel(PANEL_DATA)
    expect(cfg.prices).toContainEqual({ model: 'iPhone TEST', storage: '128', price: 1000 })
    // El override venía keyed por id "1" → debe quedar por nombre
    expect(cfg.penalties.screenCracked.overrides['iPhone TEST']).toEqual({
      type: 'percentage',
      value: 0.4,
    })
  })

  it('penalización en USD fijo (no caja) se aplica como monto, no como %', () => {
    setEngineConfig(buildConfigFromPanel(PANEL_DATA))
    const r = calculatePrice(st({ functionalityIssues: { faceId: false, camera: false, audio: true, charging: false } }))
    expect(r).not.toBeNull()
    const audio = r!.deductionBreakdown.find((d) => d.reason === 'deductAudio')!
    expect(audio.percentage).toBe(0)
    expect(audio.amount).toBe(15) // USD 15 fijo, NO 15% de 1000
    expect(r!.finalPrice).toBe(985) // 1000 - 15
  })

  it('override por modelo: iPhone TEST usa 40%, iPhone OTHER usa el 50% global', () => {
    setEngineConfig(buildConfigFromPanel(PANEL_DATA))
    const test16 = calculatePrice(st({ model: 'iPhone TEST', screenCondition: 'cracked' }))
    const other = calculatePrice(st({ model: 'iPhone OTHER', screenCondition: 'cracked' }))
    expect(test16!.finalPrice).toBe(600) // 1000 - 40%
    expect(other!.finalPrice).toBe(500) // 1000 - 50%
  })

  it('setEngineConfig es reversible: vuelve al comportamiento estático', () => {
    setEngineConfig(buildConfigFromPanel(PANEL_DATA))
    setEngineConfig(buildConfigFromStatic(pricingData as unknown as PricingConfig))
    // iPhone 15 Pro 128 perfecto = 420 (valor del pricing.json estático)
    const r = calculatePrice(st({ model: 'iPhone 15 Pro', storage: '128' }))
    expect(r!.finalPrice).toBe(420)
  })
})
