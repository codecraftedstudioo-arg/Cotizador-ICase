import type { WizardState, PriceResult, UpgradeInfo } from '@/features/wizard/types'
import type { Language } from './i18n'
import { formatPrice, formatStorage } from './pricing-engine'
import { getWhatsAppNumber } from '@/config/tenant'

export type { UpgradeInfo }

// Max URL length for wa.me links (safe limit)
const MAX_MESSAGE_LENGTH = 1500

/**
 * Sanitize user input: strip WhatsApp markdown chars and limit length
 */
function sanitize(input: string, maxLen = 50): string {
  return input.replace(/[*_~`\n\r]/g, '').trim().slice(0, maxLen)
}

/**
 * Optional contact info from the user
 */
export interface ContactInfo {
  name?: string
  phone?: string
}

// Translations for WhatsApp message
const waTranslations = {
  es: {
    greeting: 'Hola, quiero vender mi iPhone.',
    name: 'Nombre:',
    phone: 'Teléfono:',
    model: 'Modelo:',
    storage: 'Almacenamiento:',
    battery: 'Salud de batería:',
    batteryLow: 'menor a 85%',
    batteryOk: '85% o más',
    screen: 'Pantalla:',
    screenPerfect: 'impecable',
    screenScratches: 'rayones visibles',
    screenCracked: 'rota/rajada',
    back: 'Tapa trasera:',
    backPerfect: 'impecable',
    backCracked: 'rota/rajada',
    frame: 'Marco:',
    framePerfect: 'impecable',
    frameDamaged: 'dañado',
    liquidDamage: 'Daño por líquido:',
    yes: 'sí',
    no: 'no',
    issues: 'Problemas:',
    noIssues: 'ninguno',
    faceId: 'Face ID',
    camera: 'Cámara',
    audio: 'Audio',
    charging: 'Carga',
    originalScreen: 'Pantalla original:',
    originalBattery: 'Batería original:',
    originalBox: 'Caja original:',
    quote: 'Cotización estimada:',
    equivalent: 'Equivale a:',
    coordinate: '¿Podemos coordinar?',
  },
  en: {
    greeting: 'Hi, I want to sell my iPhone.',
    name: 'Name:',
    phone: 'Phone:',
    model: 'Model:',
    storage: 'Storage:',
    battery: 'Battery health:',
    batteryLow: 'below 85%',
    batteryOk: '85% or more',
    screen: 'Screen:',
    screenPerfect: 'perfect',
    screenScratches: 'visible scratches',
    screenCracked: 'cracked/broken',
    back: 'Back glass:',
    backPerfect: 'perfect',
    backCracked: 'cracked/broken',
    frame: 'Frame:',
    framePerfect: 'perfect',
    frameDamaged: 'damaged',
    liquidDamage: 'Liquid damage:',
    yes: 'yes',
    no: 'no',
    issues: 'Issues:',
    noIssues: 'none',
    faceId: 'Face ID',
    camera: 'Camera',
    audio: 'Audio',
    charging: 'Charging',
    originalScreen: 'Original screen:',
    originalBattery: 'Original battery:',
    originalBox: 'Original box:',
    quote: 'Estimated quote:',
    equivalent: 'Equivalent to:',
    coordinate: 'Can we coordinate?',
  },
}

/**
 * Builds a WhatsApp message summarizing the phone condition
 * Natural, readable format
 */
export function buildMessage(
  state: WizardState,
  priceResult: PriceResult,
  contactInfo?: ContactInfo,
  lang: Language = 'es',
  exchangeRate: number = 0,
  upgradeInfo?: UpgradeInfo
): string {
  const t = waTranslations[lang]
  const lines: string[] = []

  // Saludo distinto si es canje o venta
  if (upgradeInfo) {
    lines.push(lang === 'es'
      ? 'Hola, quiero canjear mi iPhone por uno nuevo.'
      : 'Hi, I want to trade in my iPhone for a new one.')
  } else {
    lines.push(t.greeting)
  }
  lines.push('')

  // Contact info at the top if provided
  if (contactInfo?.name) {
    lines.push(`*${t.name}* ${sanitize(contactInfo.name, 50)}`)
  }
  if (contactInfo?.phone) {
    lines.push(`*${t.phone}* ${sanitize(contactInfo.phone, 15)}`)
  }
  if (contactInfo?.name || contactInfo?.phone) {
    lines.push('')
  }

  // Model and storage
  lines.push(`*${t.model}* ${state.model}`)
  lines.push(`*${t.storage}* ${formatStorage(state.storage ?? '')}`)

  // Battery health
  lines.push(`*${t.battery}* ${state.batteryHealth === 'low' ? t.batteryLow : t.batteryOk}`)

  // Screen condition
  const screenLabels = { perfect: t.screenPerfect, scratches: t.screenScratches, cracked: t.screenCracked }
  if (state.screenCondition) {
    lines.push(`*${t.screen}* ${screenLabels[state.screenCondition]}`)
  }

  // Back condition
  const backLabels = { perfect: t.backPerfect, cracked: t.backCracked }
  if (state.backCondition) {
    lines.push(`*${t.back}* ${backLabels[state.backCondition]}`)
  }

  // Frame condition
  const frameLabels = { perfect: t.framePerfect, damaged: t.frameDamaged }
  if (state.frameCondition) {
    lines.push(`*${t.frame}* ${frameLabels[state.frameCondition]}`)
  }

  // Liquid damage
  if (state.hasLiquidDamage !== null) {
    lines.push(`*${t.liquidDamage}* ${state.hasLiquidDamage ? t.yes : t.no}`)
  }

  // Functionality issues
  const issues: string[] = []
  if (state.functionalityIssues.faceId) issues.push(t.faceId)
  if (state.functionalityIssues.camera) issues.push(t.camera)
  if (state.functionalityIssues.audio) issues.push(t.audio)
  if (state.functionalityIssues.charging) issues.push(t.charging)
  lines.push(`*${t.issues}* ${issues.length > 0 ? issues.join(', ') : t.noIssues}`)

  // Original parts
  lines.push(`*${t.originalScreen}* ${state.originalParts.screen ? t.yes : t.no}`)
  lines.push(`*${t.originalBattery}* ${state.originalParts.battery ? t.yes : t.no}`)
  lines.push(`*${t.originalBox}* ${state.hasOriginalBox ? t.yes : t.no}`)

  // Quote
  lines.push('')
  lines.push(`*${t.quote}* ${formatPrice(priceResult.finalPrice)}`)
  if (exchangeRate > 0) {
    const arsEquivalent = (priceResult.finalPrice * exchangeRate).toLocaleString('es-AR')
    lines.push(lang === 'es'
      ? `*${t.equivalent}* ${arsEquivalent} ARS (tomando dólar a ${exchangeRate.toLocaleString('es-AR')})`
      : `*${t.equivalent}* ${arsEquivalent} ARS (rate ${exchangeRate.toLocaleString('en-US')})`)
  }

  // Upgrade section - natural prose style
  if (upgradeInfo) {
    const storageLabel = formatStorage(upgradeInfo.storage)
    const diff = upgradeInfo.price - priceResult.finalPrice
    lines.push('')
    if (lang === 'es') {
      lines.push(`Quiero canjear mi iPhone por un *${upgradeInfo.model} ${storageLabel} ${upgradeInfo.color}*, que figura en *${formatPrice(upgradeInfo.price)}*.`)
      if (diff > 0) {
        lines.push(`La diferencia a pagar sería de *${formatPrice(diff)}*.`)
      } else {
        lines.push(`Me quedarían *${formatPrice(Math.abs(diff))}* a favor.`)
      }
    } else {
      lines.push(`I want to trade in my iPhone for a *${upgradeInfo.model} ${storageLabel} ${upgradeInfo.color}*, listed at *${formatPrice(upgradeInfo.price)}*.`)
      if (diff > 0) {
        lines.push(`The difference to pay would be *${formatPrice(diff)}*.`)
      } else {
        lines.push(`I would have *${formatPrice(Math.abs(diff))}* in my favor.`)
      }
    }
  }

  lines.push('')
  lines.push(t.coordinate)

  return lines.join('\n')
}

/**
 * Generates wa.me link with pre-filled message
 */
export function buildWhatsAppLink(
  state: WizardState,
  priceResult: PriceResult,
  contactInfo?: ContactInfo,
  lang: Language = 'es',
  exchangeRate: number = 0,
  upgradeInfo?: UpgradeInfo
): string {
  const message = buildMessage(state, priceResult, contactInfo, lang, exchangeRate, upgradeInfo).slice(0, MAX_MESSAGE_LENGTH)
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`
}

/**
 * Builds a WhatsApp link for inquiries (not selling yet)
 */
export function buildInquiryLink(
  state: WizardState,
  priceResult: PriceResult,
  contactInfo?: ContactInfo,
  lang: Language = 'es',
  exchangeRate: number = 0,
  upgradeInfo?: UpgradeInfo
): string {
  const t = waTranslations[lang]
  const lines: string[] = []

  lines.push(lang === 'es'
    ? (upgradeInfo
      ? 'Hola, tengo una consulta sobre un canje de iPhone.'
      : 'Hola, tengo una consulta sobre la cotización de mi iPhone.')
    : (upgradeInfo
      ? 'Hi, I have a question about an iPhone trade-in.'
      : 'Hi, I have a question about my iPhone quote.'))
  lines.push('')

  if (contactInfo?.name) lines.push(`*${t.name}* ${sanitize(contactInfo.name, 50)}`)
  if (contactInfo?.phone) lines.push(`*${t.phone}* ${sanitize(contactInfo.phone, 15)}`)
  if (contactInfo?.name || contactInfo?.phone) lines.push('')

  lines.push(`*${t.model}* ${state.model}`)
  lines.push(`*${t.storage}* ${formatStorage(state.storage ?? '')}`)
  lines.push(`*${t.battery}* ${state.batteryHealth === 'low' ? t.batteryLow : t.batteryOk}`)

  const screenLabels = { perfect: t.screenPerfect, scratches: t.screenScratches, cracked: t.screenCracked }
  if (state.screenCondition) lines.push(`*${t.screen}* ${screenLabels[state.screenCondition]}`)

  const backLabels = { perfect: t.backPerfect, cracked: t.backCracked }
  if (state.backCondition) lines.push(`*${t.back}* ${backLabels[state.backCondition]}`)

  const frameLabels = { perfect: t.framePerfect, damaged: t.frameDamaged }
  if (state.frameCondition) lines.push(`*${t.frame}* ${frameLabels[state.frameCondition]}`)

  if (state.hasLiquidDamage !== null) lines.push(`*${t.liquidDamage}* ${state.hasLiquidDamage ? t.yes : t.no}`)

  const issues: string[] = []
  if (state.functionalityIssues.faceId) issues.push(t.faceId)
  if (state.functionalityIssues.camera) issues.push(t.camera)
  if (state.functionalityIssues.audio) issues.push(t.audio)
  if (state.functionalityIssues.charging) issues.push(t.charging)
  lines.push(`*${t.issues}* ${issues.length > 0 ? issues.join(', ') : t.noIssues}`)

  lines.push(`*${t.originalScreen}* ${state.originalParts.screen ? t.yes : t.no}`)
  lines.push(`*${t.originalBattery}* ${state.originalParts.battery ? t.yes : t.no}`)
  lines.push(`*${t.originalBox}* ${state.hasOriginalBox ? t.yes : t.no}`)

  lines.push('')
  lines.push(`*${t.quote}* ${formatPrice(priceResult.finalPrice)}`)
  if (exchangeRate > 0) {
    const arsEquivalent = (priceResult.finalPrice * exchangeRate).toLocaleString('es-AR')
    lines.push(lang === 'es'
      ? `*${t.equivalent}* ${arsEquivalent} ARS (tomando dólar a ${exchangeRate.toLocaleString('es-AR')})`
      : `*${t.equivalent}* ${arsEquivalent} ARS (rate ${exchangeRate.toLocaleString('en-US')})`)
  }

  if (upgradeInfo) {
    const storageLabel = formatStorage(upgradeInfo.storage)
    const diff = upgradeInfo.price - priceResult.finalPrice
    lines.push('')
    if (lang === 'es') {
      lines.push(`Quiero canjear mi iPhone por un *${upgradeInfo.model} ${storageLabel} ${upgradeInfo.color}*, que figura en *${formatPrice(upgradeInfo.price)}*.`)
      if (diff > 0) {
        lines.push(`La diferencia a pagar sería de *${formatPrice(diff)}*.`)
      } else {
        lines.push(`Me quedarían *${formatPrice(Math.abs(diff))}* a favor.`)
      }
    } else {
      lines.push(`I want to trade in my iPhone for a *${upgradeInfo.model} ${storageLabel} ${upgradeInfo.color}*, listed at *${formatPrice(upgradeInfo.price)}*.`)
      if (diff > 0) {
        lines.push(`The difference to pay would be *${formatPrice(diff)}*.`)
      } else {
        lines.push(`I would have *${formatPrice(Math.abs(diff))}* in my favor.`)
      }
    }
  }

  const message = lines.join('\n').slice(0, MAX_MESSAGE_LENGTH)
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`
}
