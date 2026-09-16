/**
 * CRM webhook (opcional).
 *
 * Envía el lead solo si el tenant tiene CRM habilitado.
 * URL: tenant.crm.webhookUrl o, si está vacía, VITE_CRM_WEBHOOK_URL.
 * Fire-and-forget: no bloquea la UI.
 *
 * Anti-spam:
 * - Honeypot field (if filled, skip send — bot detected)
 * - Rate limiting via localStorage (max 3 sends per 5 minutes)
 */

import { getCrmWebhookUrl, isCrmEnabled } from '@/config/tenant'
const RATE_LIMIT_KEY = 'crm-webhook-sends'
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000

import type { CrmConditionFields } from './crm-lead'

export interface CrmLead extends CrmConditionFields {
  nombre: string
  telefono: string
  modelo_actual: string
  almacenamiento_actual: string
  cotizacion_estimada: number
  modelo_canje?: string
  almacenamiento_canje?: string
  color_canje?: string
  precio_canje?: number
  honeypot?: string
}

// Patrones obvios de spam (chequeamos tanto el número completo como los últimos 10 dígitos locales)
const SPAM_PATTERNS: RegExp[] = [
  /^(\d)\1{9,}$/, // todos iguales: 1111111111
  /^0123456789$/, /^1234567890$/, /^9876543210$/, // secuencias
  /0123456789$/, /1234567890$/, /9876543210$/, // secuencias al final (con prefijo 549)
]

/**
 * Detecta números con muy poca variedad (ej: 1212121212).
 * Si solo hay 2 o menos dígitos únicos, es sospechoso de spam.
 */
function hasLowDigitVariety(localDigits: string): boolean {
  const unique = new Set(localDigits)
  return unique.size <= 2
}

/**
 * Validates Argentine phone format and rejects obvious spam patterns.
 * Acepta 10-13 dígitos (con o sin prefijo 54/549/9).
 */
export function isValidArgPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+()]/g, '')
  if (!/^\d{10,13}$/.test(cleaned)) return false

  // Validación de longitud y prefijo
  let lengthOk = false
  if (cleaned.length === 10) lengthOk = true
  if (cleaned.length === 11 && cleaned.startsWith('9')) lengthOk = true
  if (cleaned.length === 12 && cleaned.startsWith('54')) lengthOk = true
  if (cleaned.length === 13 && cleaned.startsWith('549')) lengthOk = true
  if (!lengthOk) return false

  // Rechazar patrones obvios de spam
  if (SPAM_PATTERNS.some(p => p.test(cleaned))) return false

  // Obtener los últimos 10 dígitos locales (área + número) y validar variedad
  const localDigits = cleaned.slice(-10)
  if (hasLowDigitVariety(localDigits)) return false

  return true
}

/**
 * Returns true if the user has exceeded the rate limit.
 */
function isRateLimited(): boolean {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY)
    if (!raw) return false
    const sends: number[] = JSON.parse(raw)
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS
    const recent = sends.filter(t => t > cutoff)
    return recent.length >= RATE_LIMIT_MAX
  } catch {
    return false
  }
}

function recordSend() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY)
    const sends: number[] = raw ? JSON.parse(raw) : []
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS
    const recent = sends.filter(t => t > cutoff)
    recent.push(Date.now())
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent))
  } catch { /* ignore */ }
}

/**
 * Sends a lead to the CRM webhook. Fire-and-forget.
 * Returns true if the send was attempted, false if blocked (bot/rate limit).
 */
export async function sendLeadToCrm(lead: CrmLead): Promise<boolean> {
  // Honeypot: if filled, it's a bot, silently discard
  if (lead.honeypot && lead.honeypot.trim() !== '') {
    return false
  }

  // Rate limit check
  if (isRateLimited()) {
    return false
  }

  // Validate required fields
  if (!lead.nombre || !lead.telefono) {
    return false
  }
  if (!isValidArgPhone(lead.telefono)) {
    return false
  }

  // Strip honeypot before sending
  const { honeypot: _, ...payload } = lead

  recordSend()

  // En desarrollo local no se manda al CRM real (evita ensuciar datos con tests)
  if (import.meta.env.DEV) {
    console.log('[DEV] CRM webhook (NO enviado):', payload)
    return true
  }

  if (!isCrmEnabled()) {
    if (import.meta.env.DEV) {
      console.log('[DEV] CRM deshabilitado en tenant — lead no enviado')
    }
    return true
  }

  const webhookUrl = getCrmWebhookUrl()
  if (!webhookUrl) {
    console.error('[CRM] Falta webhook — lead no enviado')
    return false
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
    return true
  } catch {
    return false
  }
}
