import { describe, it, expect, beforeEach, vi } from 'vitest'
import { isValidArgPhone, sendLeadToCrm } from './crm-webhook'

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

describe('isValidArgPhone', () => {
  it('acepta teléfono argentino de 10 dígitos', () => {
    expect(isValidArgPhone('1156789012')).toBe(true)
  })

  it('acepta formato 11 dígitos empezando con 9', () => {
    expect(isValidArgPhone('91156789012')).toBe(true)
  })

  it('acepta formato 12 dígitos con 54 prefix', () => {
    expect(isValidArgPhone('541156789012')).toBe(true)
  })

  it('acepta formato +549 13 dígitos', () => {
    expect(isValidArgPhone('5491156789012')).toBe(true)
  })

  it('acepta formato con espacios y guiones', () => {
    expect(isValidArgPhone('11-5678-9012')).toBe(true)
    expect(isValidArgPhone('+54 11 5678 9012')).toBe(true)
  })

  it('rechaza string vacío', () => {
    expect(isValidArgPhone('')).toBe(false)
  })

  it('rechaza menos de 10 dígitos', () => {
    expect(isValidArgPhone('123456')).toBe(false)
  })

  it('rechaza solo letras', () => {
    expect(isValidArgPhone('abcdefghij')).toBe(false)
  })

  it('rechaza más de 13 dígitos', () => {
    expect(isValidArgPhone('12345678901234')).toBe(false)
  })

  it('rechaza "0000000000" aunque tenga formato válido', () => {
    expect(isValidArgPhone('0000000000')).toBe(false)
    expect(isValidArgPhone('5490000000000')).toBe(false)
  })

  it('rechaza secuencias "1234567890"', () => {
    expect(isValidArgPhone('1234567890')).toBe(false)
    expect(isValidArgPhone('5491234567890')).toBe(false)
  })

  it('rechaza números con muy poca variedad de dígitos (ej: 1212121212)', () => {
    expect(isValidArgPhone('1212121212')).toBe(false)
    expect(isValidArgPhone('5491212121212')).toBe(false)
  })

  it('acepta números normales con variedad de dígitos', () => {
    expect(isValidArgPhone('1156789012')).toBe(true)
    expect(isValidArgPhone('5491156789012')).toBe(true)
  })
})

describe('sendLeadToCrm — anti-spam', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    // Simular producción en tests para que se dispare el fetch real
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_CRM_WEBHOOK_URL', 'https://test.example/hook')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))
  })

  it('descarta envío si el honeypot está lleno (bot)', async () => {
    const result = await sendLeadToCrm({
      nombre: 'Juan',
      telefono: '1156789012',
      modelo_actual: 'iPhone 15',
      almacenamiento_actual: '128',
      cotizacion_estimada: 350,
      honeypot: 'bot-filled-this',
    })
    expect(result).toBe(false)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('descarta envío si falta nombre', async () => {
    const result = await sendLeadToCrm({
      nombre: '',
      telefono: '1156789012',
      modelo_actual: 'iPhone 15',
      almacenamiento_actual: '128',
      cotizacion_estimada: 350,
    })
    expect(result).toBe(false)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('descarta envío si falta teléfono', async () => {
    const result = await sendLeadToCrm({
      nombre: 'Juan',
      telefono: '',
      modelo_actual: 'iPhone 15',
      almacenamiento_actual: '128',
      cotizacion_estimada: 350,
    })
    expect(result).toBe(false)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('descarta envío si el teléfono no es válido', async () => {
    const result = await sendLeadToCrm({
      nombre: 'Juan',
      telefono: 'no-es-tel',
      modelo_actual: 'iPhone 15',
      almacenamiento_actual: '128',
      cotizacion_estimada: 350,
    })
    expect(result).toBe(false)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('envía lead válido al webhook', async () => {
    const result = await sendLeadToCrm({
      nombre: 'Juan Perez',
      telefono: '1156789012',
      modelo_actual: 'iPhone 15',
      almacenamiento_actual: '128',
      cotizacion_estimada: 350,
    })
    expect(result).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('NO incluye el honeypot en el payload enviado', async () => {
    await sendLeadToCrm({
      nombre: 'Juan',
      telefono: '1156789012',
      modelo_actual: 'iPhone 15',
      almacenamiento_actual: '128',
      cotizacion_estimada: 350,
      honeypot: '',
    })
    const call = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(call[1].body)
    expect(body).not.toHaveProperty('honeypot')
    expect(body.nombre).toBe('Juan')
  })

  it('incluye datos de canje cuando vienen', async () => {
    await sendLeadToCrm({
      nombre: 'Juan',
      telefono: '1156789012',
      modelo_actual: 'iPhone 15',
      almacenamiento_actual: '128',
      cotizacion_estimada: 350,
      modelo_canje: 'iPhone 17 Pro',
      almacenamiento_canje: '256',
      color_canje: 'Orange',
      precio_canje: 1310,
    })
    const call = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(call[1].body)
    expect(body.modelo_canje).toBe('iPhone 17 Pro')
    expect(body.precio_canje).toBe(1310)
  })

  it('rate limiting: bloquea después de 3 envíos en 5 minutos', async () => {
    const lead = {
      nombre: 'Juan',
      telefono: '1156789012',
      modelo_actual: 'iPhone 15',
      almacenamiento_actual: '128',
      cotizacion_estimada: 350,
    }
    expect(await sendLeadToCrm(lead)).toBe(true)
    expect(await sendLeadToCrm(lead)).toBe(true)
    expect(await sendLeadToCrm(lead)).toBe(true)
    // Cuarto envío bloqueado
    expect(await sendLeadToCrm(lead)).toBe(false)
    expect(globalThis.fetch).toHaveBeenCalledTimes(3)
  })
})
