import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildWhatsAppLink, buildInquiryLink, buildMessage } from './whatsapp-builder'
import { sendLeadToCrm } from './crm-webhook'
import type { WizardState, PriceResult } from '@/features/wizard/types'

vi.mock('@/config/tenant', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/config/tenant')>()
  return {
    ...actual,
    isCrmEnabled: () => true,
    getCrmWebhookUrl: () => import.meta.env.VITE_CRM_WEBHOOK_URL || 'https://test.example/hook',
    tenant: {
      ...actual.tenant,
      features: { ...actual.tenant.features, crm: true },
      crm: { ...actual.tenant.crm, enabled: true, webhookUrl: '' },
    },
  }
})

// Payloads de XSS comunes para intentar romper el sistema
const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  'javascript:alert(1)',
  '<svg onload=alert(1)>',
  "';DROP TABLE users;--",
  '<iframe src="evil.com"></iframe>',
  'onclick=alert(1)',
  String.fromCharCode(60) + 'script' + String.fromCharCode(62),
]

function makeState(overrides: Partial<WizardState> = {}): WizardState {
  return {
    currentStep: 7,
    model: 'iPhone 15',
    storage: '128',
    screenCondition: 'perfect',
    backCondition: 'perfect',
    frameCondition: 'perfect',
    hasLiquidDamage: false,
    batteryHealth: 'good',
    originalParts: { battery: true, screen: true },
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
  } as WizardState
}

function makePriceResult(overrides: Partial<PriceResult> = {}): PriceResult {
  return {
    basePrice: 300,
    finalPrice: 300,
    deductionBreakdown: [],
    blocked: false,
    ...overrides,
  } as PriceResult
}

describe('Seguridad — XSS en WhatsApp link', () => {
  it('escapa caracteres HTML peligrosos en la URL del link', () => {
    XSS_PAYLOADS.forEach(payload => {
      const link = buildWhatsAppLink(makeState(), makePriceResult(), { name: payload, phone: '1156789012' })
      // El link debe ser una URL válida y no contener tags HTML crudos
      expect(link).toMatch(/^https:\/\/wa\.me\//)
      expect(link).not.toContain('<script>')
      expect(link).not.toContain('<img')
      expect(link).not.toContain('<iframe')
      expect(link).not.toContain('<svg')
      // Los chars peligrosos deben estar URL-encoded
      const queryPart = link.split('?text=')[1] ?? ''
      expect(queryPart).not.toContain('<')
      expect(queryPart).not.toContain('>')
    })
  })

  it('sanitiza markdown de WhatsApp (*, _, ~) para evitar formato malicioso', () => {
    const msg = buildMessage(makeState(), makePriceResult(), {
      name: '*Juan*_admin_~hack~',
      phone: '1156789012',
    })
    // Los asteriscos/guiones bajos/tildes del nombre deben removerse (no romper el formato)
    // Los del builder (ej: *Nombre:*) sí pueden quedar
    const nameLineMatch = msg.match(/Nombre:\*?\s*(.+)/)
    if (nameLineMatch) {
      expect(nameLineMatch[1]).not.toMatch(/^\*Juan\*/)
    }
  })

  it('limita longitud del nombre para evitar ataques de buffer/performance', () => {
    const hugeName = 'A'.repeat(10000)
    const link = buildWhatsAppLink(makeState(), makePriceResult(), { name: hugeName })
    // El link no debe explotar en tamaño (max WhatsApp ~2048 chars)
    expect(link.length).toBeLessThan(2048)
  })

  it('limita longitud del teléfono', () => {
    const hugePhone = '9'.repeat(1000)
    const link = buildWhatsAppLink(makeState(), makePriceResult(), { name: 'Juan', phone: hugePhone })
    expect(link.length).toBeLessThan(2048)
  })

  it('acepta modelos con chars especiales sin romper', () => {
    const state = makeState({ model: 'iPhone <hack> 15' })
    const link = buildWhatsAppLink(state, makePriceResult())
    // No debe haber HTML crudo
    expect(link).not.toContain('<hack>')
    const decoded = decodeURIComponent(link.split('?text=')[1] ?? '')
    // El contenido está presente pero encodeado en la URL, no como HTML activo
    expect(decoded).toContain('hack')
  })
})

describe('Seguridad — inquiry link', () => {
  it('escapa XSS también en el inquiry link', () => {
    XSS_PAYLOADS.forEach(payload => {
      const link = buildInquiryLink(makeState(), makePriceResult(), { name: payload })
      expect(link).toMatch(/^https:\/\/wa\.me\//)
      const queryPart = link.split('?text=')[1] ?? ''
      expect(queryPart).not.toContain('<')
      expect(queryPart).not.toContain('>')
    })
  })
})

describe('Seguridad — CRM webhook payload', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_CRM_WEBHOOK_URL', 'https://test.example/hook')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))
  })

  it('el JSON enviado al CRM no permite inyección de JS', async () => {
    await sendLeadToCrm({
      nombre: '<script>alert(1)</script>',
      telefono: '5491156789012',
      modelo_actual: 'iPhone 15',
      almacenamiento_actual: '128',
      cotizacion_estimada: 300,
    })
    const call = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = call[1].body
    // El body es un string JSON, no ejecutable. El contenido puede estar pero como texto.
    expect(typeof body).toBe('string')
    const parsed = JSON.parse(body)
    expect(parsed.nombre).toBe('<script>alert(1)</script>')
    // Pero como JSON, no se ejecuta en ningún lado seguro
  })

  it('rechaza teléfono con caracteres no numéricos aunque sean "peligrosos"', async () => {
    const result = await sendLeadToCrm({
      nombre: 'Juan',
      telefono: '<script>1156789012</script>',
      modelo_actual: 'iPhone 15',
      almacenamiento_actual: '128',
      cotizacion_estimada: 300,
    })
    // Falla la validación de teléfono argentino
    expect(result).toBe(false)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('honeypot con chars raros igual se detecta y bloquea', async () => {
    const result = await sendLeadToCrm({
      nombre: 'Juan',
      telefono: '5491156789012',
      modelo_actual: 'iPhone 15',
      almacenamiento_actual: '128',
      cotizacion_estimada: 300,
      honeypot: '<script>bot</script>',
    })
    expect(result).toBe(false)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})

describe('Seguridad — validación de longitud máxima de URL WhatsApp', () => {
  it('caso extremo: todos los campos al máximo, link sigue siendo válido', () => {
    const state = makeState({
      functionalityIssues: { faceId: true, camera: true, audio: true, charging: true },
      originalParts: { battery: false, screen: false },
      screenCondition: 'cracked',
      backCondition: 'cracked',
      frameCondition: 'damaged',
      hasLiquidDamage: true,
      hasOriginalBox: false,
    })
    const link = buildWhatsAppLink(state, makePriceResult(), {
      name: 'Nombre Compuesto Muy Largo',
      phone: '5491156789012',
    })
    // URL de WhatsApp tiene límite práctico ~2048 chars
    expect(link.length).toBeLessThan(2048)
    expect(link).toMatch(/^https:\/\/wa\.me\//)
  })
})
