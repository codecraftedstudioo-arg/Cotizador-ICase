import { describe, it, expect } from 'vitest'
import { calculatePrice, formatPrice, getAvailableModels, getStorageForModel } from './pricing-engine'
import type { WizardState, StorageCapacity } from '@/features/wizard/types'

// Helper para crear estado completo con nueva estructura
function createWizardState(overrides: Partial<WizardState> = {}): WizardState {
  return {
    currentStep: 6,
    model: 'iPhone 15 Pro',
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

describe('calculatePrice', () => {
  it('returns null if model is missing', () => {
    const state = createWizardState({ model: null })
    expect(calculatePrice(state)).toBeNull()
  })

  it('returns null if storage is missing', () => {
    const state = createWizardState({ storage: null })
    expect(calculatePrice(state)).toBeNull()
  })

  it('returns blocked if iCloud is on', () => {
    const state = createWizardState({ iCloudOff: false })
    const result = calculatePrice(state)

    expect(result).not.toBeNull()
    expect(result!.blocked).toBe(true)
    expect(result!.blockedReason).toBe('iCloudBlocked')
  })

  it('calculates perfect condition iPhone at fixed price', () => {
    const state = createWizardState()
    const result = calculatePrice(state)

    expect(result).not.toBeNull()
    expect(result!.finalPrice).toBe(420) // Fixed price for iPhone 15 Pro 128GB
    expect(result!.totalDeductions).toBe(0)
    expect(result!.deductionBreakdown).toHaveLength(0)
  })

  it('returns correct price for different storage', () => {
    const state = createWizardState({ storage: '256' })
    const result = calculatePrice(state)

    expect(result).not.toBeNull()
    expect(result!.finalPrice).toBe(450) // Fixed price for iPhone 15 Pro 256GB
  })

  it('applies battery low deduction (15%)', () => {
    const state = createWizardState({ batteryHealth: 'low' })
    const result = calculatePrice(state)

    expect(result).not.toBeNull()
    // 420 × 0.15 = 63 → round to 65, final = 420-65 = 355
    expect(result!.totalDeductions).toBe(0.15)
    expect(result!.finalPrice).toBe(355)
    expect(result!.deductionBreakdown).toHaveLength(1)
    expect(result!.deductionBreakdown[0].reason).toBe('deductBatteryLow')
  })

  it('applies screen cracked deduction (50%)', () => {
    const state = createWizardState({ screenCondition: 'cracked' })
    const result = calculatePrice(state)

    expect(result!.totalDeductions).toBe(0.50)
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductScreenCracked')).toBe(true)
  })

  it('applies screen scratches deduction (5%)', () => {
    const state = createWizardState({ screenCondition: 'scratches' })
    const result = calculatePrice(state)

    expect(result!.totalDeductions).toBe(0.05)
  })

  it('applies back cracked deduction (20%)', () => {
    const state = createWizardState({ backCondition: 'cracked' })
    const result = calculatePrice(state)

    expect(result!.totalDeductions).toBe(0.20)
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductBackCracked')).toBe(true)
  })

  it('applies frame damaged deduction (8%)', () => {
    const state = createWizardState({ frameCondition: 'damaged' })
    const result = calculatePrice(state)

    expect(result!.totalDeductions).toBe(0.08)
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductFrameDamaged')).toBe(true)
  })

  it('applies liquid damage deduction (20%)', () => {
    const state = createWizardState({ hasLiquidDamage: true })
    const result = calculatePrice(state)

    expect(result!.totalDeductions).toBe(0.20)
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductLiquidDamage')).toBe(true)
  })

  it('applies no original box deduction (fixed USD $20)', () => {
    const state = createWizardState({ hasOriginalBox: false })
    const result = calculatePrice(state)

    expect(result).not.toBeNull()
    // Fixed $20 deduction, not percentage-based
    expect(result!.finalPrice).toBe(400) // 420 - 20 = 400
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductNoOriginalBox')).toBe(true)
    expect(result!.deductionBreakdown.find(d => d.reason === 'deductNoOriginalBox')!.amount).toBe(20)
    expect(result!.deductionBreakdown.find(d => d.reason === 'deductNoOriginalBox')!.percentage).toBe(0)
  })

  it('does not deduct for original box present', () => {
    const state = createWizardState({ hasOriginalBox: true })
    const result = calculatePrice(state)

    expect(result).not.toBeNull()
    expect(result!.finalPrice).toBe(420)
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductNoOriginalBox')).toBe(false)
  })

  it('applies non-original battery deduction (15%)', () => {
    const state = createWizardState({
      originalParts: { screen: true, battery: false },
    })
    const result = calculatePrice(state)

    expect(result!.totalDeductions).toBe(0.15)
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductBatteryNotOriginal')).toBe(true)
  })

  it('applies non-original screen deduction (25%)', () => {
    const state = createWizardState({
      originalParts: { screen: false, battery: true },
    })
    const result = calculatePrice(state)

    expect(result!.totalDeductions).toBe(0.25)
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductScreenNotOriginal')).toBe(true)
  })

  it('applies Face ID deduction (30%)', () => {
    const state = createWizardState({
      functionalityIssues: { faceId: true, camera: false, audio: false, charging: false },
    })
    const result = calculatePrice(state)

    expect(result!.totalDeductions).toBe(0.30)
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductFaceId')).toBe(true)
  })

  it('applies camera deduction (30%)', () => {
    const state = createWizardState({
      functionalityIssues: { faceId: false, camera: true, audio: false, charging: false },
    })
    const result = calculatePrice(state)

    expect(result!.totalDeductions).toBe(0.30)
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductCamera')).toBe(true)
  })

  it('applies charging deduction (30%)', () => {
    const state = createWizardState({
      functionalityIssues: { faceId: false, camera: false, audio: false, charging: true },
    })
    const result = calculatePrice(state)

    expect(result!.totalDeductions).toBe(0.30)
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductCharging')).toBe(true)
  })

  it('applies multiple deductions correctly', () => {
    const state = createWizardState({
      batteryHealth: 'low', // 15%
      screenCondition: 'scratches', // 5%
      frameCondition: 'damaged', // 8%
    })
    const result = calculatePrice(state)

    expect(result).not.toBeNull()
    // Total deductions: 15 + 5 + 8 = 28%
    expect(result!.totalDeductions).toBe(0.28)
    // 420 × 0.28 = 117.6 → round to 120, final = 420-120 = 300
    expect(result!.finalPrice).toBe(300)
    expect(result!.deductionBreakdown).toHaveLength(3)
  })

  // === EDGE CASES & STRESS TESTS ===

  it('worst case: all deductions maxed out, price never goes below 0', () => {
    const state = createWizardState({
      model: 'iPhone 13 mini',
      storage: '128', // lowest price: $130
      screenCondition: 'cracked', // 50%
      backCondition: 'cracked', // 20%
      frameCondition: 'damaged', // 8%
      hasLiquidDamage: true, // 20%
      batteryHealth: 'low', // 15%
      originalParts: { screen: false, battery: false }, // 25% + 15%
      functionalityIssues: { faceId: true, camera: true, audio: true, charging: true }, // 30+30+15+30
    })
    const result = calculatePrice(state)

    expect(result).not.toBeNull()
    // Total: 50+20+8+20+15+25+15+30+30+15+30 = 258% → capped behavior
    expect(result!.finalPrice).toBe(0) // should never be negative
    expect(result!.finalPrice).toBeGreaterThanOrEqual(0)
  })

  it('screen cracked + screen not original both apply (75% screen penalty)', () => {
    const state = createWizardState({
      screenCondition: 'cracked', // 50%
      originalParts: { screen: false, battery: true }, // 25%
    })
    const result = calculatePrice(state)

    expect(result).not.toBeNull()
    // 50% + 25% = 75% deduction
    expect(result!.totalDeductions).toBe(0.75)
    expect(result!.finalPrice).toBe(105) // 420 * 0.25 = 105
    expect(result!.deductionBreakdown).toHaveLength(2)
  })

  it('all functionality issues apply together', () => {
    const state = createWizardState({
      functionalityIssues: { faceId: true, camera: true, audio: true, charging: true },
    })
    const result = calculatePrice(state)

    // 30 + 30 + 15 + 30 = 105%
    expect(result!.totalDeductions).toBe(1.05)
    expect(result!.finalPrice).toBe(0) // can't go negative
    expect(result!.deductionBreakdown).toHaveLength(4)
  })

  it('audio deduction applies (15%)', () => {
    const state = createWizardState({
      functionalityIssues: { faceId: false, camera: false, audio: true, charging: false },
    })
    const result = calculatePrice(state)

    expect(result!.totalDeductions).toBe(0.15)
    expect(result!.deductionBreakdown.some(d => d.reason === 'deductAudio')).toBe(true)
  })

  it('perfect condition for every model returns base price', () => {
    const models = [
      { model: 'iPhone 13', storage: '128', expected: 200 },
      { model: 'iPhone 13 mini', storage: '128', expected: 150 },
      { model: 'iPhone 14 Pro Max', storage: '1024', expected: 450 },
      { model: 'iPhone 15 Pro Max', storage: '1024', expected: 600 },
      { model: 'iPhone 16 Pro Max', storage: '1024', expected: 800 },
    ]

    models.forEach(({ model, storage, expected }) => {
      const state = createWizardState({ model, storage: storage as StorageCapacity })
      const result = calculatePrice(state)
      expect(result).not.toBeNull()
      expect(result!.finalPrice).toBe(expected)
      expect(result!.totalDeductions).toBe(0)
    })
  })

  it('returns null for valid model but invalid storage', () => {
    const state = createWizardState({ model: 'iPhone 13', storage: '1024' })
    expect(calculatePrice(state)).toBeNull()
  })

  it('iCloud blocked returns 0 price with blocked flag', () => {
    const state = createWizardState({ iCloudOff: false })
    const result = calculatePrice(state)

    expect(result!.blocked).toBe(true)
    expect(result!.finalPrice).toBe(0)
    expect(result!.basePrice).toBe(0)
  })

  it('user scenario: iPhone 13 256GB camera broken + screen not original', () => {
    const state = createWizardState({
      model: 'iPhone 13',
      storage: '256', // base $230
      functionalityIssues: { faceId: false, camera: true, audio: false, charging: false }, // 30%
      originalParts: { screen: false, battery: true }, // 25%
    })
    const result = calculatePrice(state)

    // 30% + 25% = 55% deduction
    // 230 × 0.55 = 126.5 → roundTo5 = 125, final = 230-125 = 105
    expect(result!.finalPrice).toBe(105)
  })
})

describe('getAvailableModels', () => {
  it('returns array of model names', () => {
    const models = getAvailableModels()
    expect(Array.isArray(models)).toBe(true)
    expect(models.length).toBeGreaterThan(0)
    expect(models).toContain('iPhone 15 Pro')
  })
})

describe('getStorageForModel', () => {
  it('returns storage options for a model', () => {
    const storage = getStorageForModel('iPhone 15 Pro')
    expect(Array.isArray(storage)).toBe(true)
    expect(storage).toContain('128')
    expect(storage).toContain('256')
  })

  it('returns empty array for unknown model', () => {
    const storage = getStorageForModel('Unknown Model')
    expect(storage).toHaveLength(0)
  })
})

describe('formatPrice', () => {
  it('formats price as US Dollars', () => {
    const formatted = formatPrice(550)
    expect(formatted).toBe('USD 550')
  })

  it('handles zero price', () => {
    const formatted = formatPrice(0)
    expect(formatted).toContain('0')
  })
})
