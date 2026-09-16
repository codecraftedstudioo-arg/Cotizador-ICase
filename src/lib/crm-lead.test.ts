import { describe, it, expect } from 'vitest'
import { buildCrmConditionFields } from './crm-lead'
import type { WizardState } from '@/features/wizard/types'

// Estado base (equipo impecable, todo original) — se sobrescribe por test.
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

describe('buildCrmConditionFields', () => {
  it('mapea un equipo impecable a etiquetas legibles', () => {
    const fields = buildCrmConditionFields(createWizardState())
    expect(fields.salud_bateria).toBe('85% o más')
    expect(fields.estado_pantalla).toBe('impecable')
    expect(fields.estado_tapa).toBe('impecable')
    expect(fields.estado_marco).toBe('impecable')
    expect(fields.dano_liquido).toBe('no')
    expect(fields.fallas).toBe('ninguno')
    expect(fields.pantalla_original).toBe('sí')
    expect(fields.bateria_original).toBe('sí')
    expect(fields.caja_original).toBe('sí')
  })

  it('mapea un equipo dañado con fallas múltiples', () => {
    const fields = buildCrmConditionFields(createWizardState({
      batteryHealth: 'low',
      screenCondition: 'cracked',
      backCondition: 'cracked',
      frameCondition: 'damaged',
      hasLiquidDamage: true,
      functionalityIssues: { faceId: true, camera: true, audio: false, charging: false },
      originalParts: { screen: false, battery: false },
      hasOriginalBox: false,
    }))
    expect(fields.salud_bateria).toBe('menor a 85%')
    expect(fields.estado_pantalla).toBe('rota/rajada')
    expect(fields.estado_tapa).toBe('rota/rajada')
    expect(fields.estado_marco).toBe('dañado')
    expect(fields.dano_liquido).toBe('sí')
    expect(fields.fallas).toBe('Face ID, Cámara')
    expect(fields.pantalla_original).toBe('no')
    expect(fields.bateria_original).toBe('no')
    expect(fields.caja_original).toBe('no')
  })

  it('lista "rayones visibles" para pantalla con scratches', () => {
    const fields = buildCrmConditionFields(createWizardState({ screenCondition: 'scratches' }))
    expect(fields.estado_pantalla).toBe('rayones visibles')
  })

  it('arma un campo resumen legible con todo el estado', () => {
    const fields = buildCrmConditionFields(createWizardState({
      screenCondition: 'scratches',
      functionalityIssues: { faceId: true, camera: false, audio: false, charging: false },
    }))
    expect(fields.detalle_estado).toContain('Pantalla: rayones visibles')
    expect(fields.detalle_estado).toContain('Fallas: Face ID')
    expect(fields.detalle_estado).toContain('Batería: 85% o más')
    expect(fields.detalle_estado).toContain(' | ')
  })

  it('omite los campos que el usuario no respondió (null)', () => {
    const fields = buildCrmConditionFields(createWizardState({
      screenCondition: null,
      backCondition: null,
      frameCondition: null,
      hasLiquidDamage: null,
      batteryHealth: null,
      originalParts: { screen: null, battery: null },
      hasOriginalBox: null,
    }))
    expect(fields.salud_bateria).toBeUndefined()
    expect(fields.estado_pantalla).toBeUndefined()
    expect(fields.dano_liquido).toBeUndefined()
    expect(fields.pantalla_original).toBeUndefined()
    expect(fields.caja_original).toBeUndefined()
    // Fallas siempre se reporta (aunque sea "ninguno")
    expect(fields.fallas).toBe('ninguno')
  })
})
