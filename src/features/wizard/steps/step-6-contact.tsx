import { useState, useRef } from 'react'
import { Card, CardHeader, Button } from '@/components/ui'
import { useWizard } from '../hooks/use-wizard'
import { useI18n } from '@/lib/i18n'
import { calculatePrice, getDisplayedOfferPrice } from '@/lib/pricing-engine'
import { isValidArgPhone, sendLeadToCrm } from '@/lib/crm-webhook'
import { buildCrmConditionFields } from '@/lib/crm-lead'
import { getPhoneCountryCode } from '@/config/tenant'

/**
 * Step 6: Contact info (mandatory before showing result).
 * Sends lead to CRM and then advances to the result.
 */
export function Step6Contact() {
  const { state, setContactName, setContactPhone, nextStep } = useWizard()
  const { lang } = useI18n()
  const [honeypot, setHoneypot] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [phoneOverflow, setPhoneOverflow] = useState(false)
  const [nameOverflow, setNameOverflow] = useState(false)
  const phoneTimeoutRef = useRef<number | null>(null)
  const nameTimeoutRef = useRef<number | null>(null)
  // Guard síncrono contra doble-click (más confiable que el state submitting)
  const submittingRef = useRef(false)

  const name = state.contactName ?? ''
  const phone = state.contactPhone ?? ''

  // Validaciones
  const trimmedName = name.trim()
  // Contar solo letras reales (sin espacios ni apóstrofes) para evitar inputs tipo "   " o "'''"
  const letterCount = (trimmedName.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g) || []).length
  const nameTooShort = trimmedName.length > 0 && letterCount < 3
  const nameValid = letterCount >= 3
  const phonePrefix = getPhoneCountryCode()
  // El input solo tiene los 10 dígitos locales (área + número).
  // Validamos con el prefijo del tenant (default 549) para reusar isValidArgPhone.
  const phoneDigitsLen = phone.replace(/\D/g, '').length
  const phoneValid = phoneDigitsLen === 10 && isValidArgPhone(`${phonePrefix}${phone}`)
  // Mostrar warning solo cuando ya hay 10 dígitos pero falla validación
  const showInvalidPhone = phoneDigitsLen === 10 && !phoneValid
  const canContinue = nameValid && phoneValid

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo letras, espacios, acentos, guiones y apóstrofes (sin puntos ni números)
    // Colapsa espacios múltiples, max 50 chars
    let value = e.target.value
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']/g, '') // solo letras, espacios, apóstrofes (sin guiones, números, símbolos, emojis)
      .replace(/'{2,}/g, "'") // no múltiples apóstrofes
      .replace(/\s{2,}/g, ' ') // no múltiples espacios
      .replace(/^\s+/, '') // no permitir espacio al inicio
      .replace(/^'+/, '') // no permitir apóstrofe al inicio
    if (value.length > 30) {
      setNameOverflow(true)
      if (nameTimeoutRef.current) window.clearTimeout(nameTimeoutRef.current)
      nameTimeoutRef.current = window.setTimeout(() => setNameOverflow(false), 3000)
    } else {
      setNameOverflow(false)
    }
    setContactName(value.slice(0, 30))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Guarda solo los 10 dígitos locales (área + número, sin prefijo país).
    // El prefijo +54 9 se agrega al enviar al CRM.
    const allDigits = e.target.value.replace(/\D/g, '')
    if (allDigits.length > 10) {
      setPhoneOverflow(true)
      if (phoneTimeoutRef.current) window.clearTimeout(phoneTimeoutRef.current)
      phoneTimeoutRef.current = window.setTimeout(() => setPhoneOverflow(false), 3000)
    } else {
      setPhoneOverflow(false)
    }
    setContactPhone(allDigits.slice(0, 10))
  }

  const handleContinue = async () => {
    setNameTouched(true)
    setPhoneTouched(true)
    if (!canContinue || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)

    const priceResult = calculatePrice(state)
    const isCanje = Boolean(state.upgradeModel)
    const offerFinal = priceResult
      ? getDisplayedOfferPrice(priceResult.finalPrice, isCanje ? 'canje' : 'sell')
      : 0

    // Prefijo de país desde tenant (default Argentina 549)
    const fullPhone = `${phonePrefix}${phone.trim()}`

    await sendLeadToCrm({
      nombre: name.trim(),
      telefono: fullPhone,
      modelo_actual: state.model ?? '',
      almacenamiento_actual: state.storage ?? '',
      cotizacion_estimada: offerFinal,
      modelo_canje: state.upgradeModel ?? undefined,
      almacenamiento_canje: state.upgradeStorage ?? undefined,
      color_canje: state.upgradeColor ?? undefined,
      precio_canje: state.upgradePrice ?? undefined,
      // Estado del equipo (batería, pantalla, fallas, etc.) para que quede en
      // la ficha del CRM, no solo en el mensaje de WhatsApp.
      ...buildCrmConditionFields(state),
      honeypot,
    })

    setSubmitting(false)
    nextStep()
  }

  return (
    <Card>
      <CardHeader
        title={lang === 'es' ? '¿Adónde te enviamos tu cotización?' : 'Where should we send your quote?'}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="contact-name" className="block text-sm text-fg-muted font-medium">
            {lang === 'es' ? 'Nombre' : 'Name'}
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder={lang === 'es' ? 'Tu nombre' : 'Your name'}
            className={`w-full px-4 py-3 rounded-xl bg-surface dark:bg-white/5 border text-fg placeholder:text-fg-subtle focus:outline-none transition-colors ${
              nameTouched && nameTooShort ? 'border-red-500/60' : 'border-line focus:border-accent'
            }`}
            autoComplete="name"
          />
          {nameOverflow && (
            <p className="text-xs text-amber-400">
              {lang === 'es' ? 'Máximo 30 caracteres' : 'Max 30 characters'}
            </p>
          )}
          {nameTouched && nameTooShort && !nameOverflow && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {lang === 'es' ? 'Ingresá tu nombre completo' : 'Enter your full name'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="contact-phone" className="block text-sm text-fg-muted font-medium">
            {lang === 'es' ? 'WhatsApp' : 'WhatsApp'}
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder={lang === 'es' ? 'Ej: 11 1234 5678' : 'e.g. 11 1234 5678'}
            className={`w-full px-4 py-3 rounded-xl bg-surface dark:bg-white/5 border text-fg placeholder:text-fg-subtle focus:outline-none transition-colors ${
              (phoneTouched || showInvalidPhone) && !phoneValid ? 'border-red-500/60' : 'border-line focus:border-accent'
            }`}
            autoComplete="tel"
            inputMode="numeric"
          />
          {phoneOverflow && (
            <p className="text-xs text-amber-400">
              {lang === 'es' ? 'Máximo 10 dígitos (área + número)' : 'Max 10 digits (area + number)'}
            </p>
          )}
          {showInvalidPhone && !phoneOverflow && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {lang === 'es' ? 'Ingresá un número válido' : 'Enter a valid number'}
            </p>
          )}
        </div>

        {/* Honeypot - invisible field for bots */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
          />
        </div>

        <p className="text-xs text-fg-subtle">
          {lang === 'es'
            ? 'Te enviamos la cotización y te contactamos por WhatsApp.'
            : 'We send you the quote and contact you via WhatsApp.'}
        </p>
      </div>

      <Button onClick={handleContinue} fullWidth disabled={!canContinue || submitting} className="mt-6">
        {submitting
          ? (lang === 'es' ? 'Enviando...' : 'Sending...')
          : (lang === 'es' ? 'Ver mi cotización' : 'See my quote')}
      </Button>
    </Card>
  )
}
