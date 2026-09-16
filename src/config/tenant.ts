/**
 * Configuración del cliente (tenant).
 *
 * Cambiá este archivo para personalizar marca, contacto, SEO y features
 * sin recorrer el resto del código.
 *
 * Los valores de abajo son DEMO / placeholders. No representan un negocio real.
 */

export type TenantLanguage = 'es' | 'en'
export type TenantCountry = 'AR' | 'UY' | 'CL' | 'MX' | 'US' | 'OTHER'
export type TenantCurrency = 'USD' | 'ARS' | 'EUR'
export type PricingSourceType = 'static' | 'api'
export type CrmProvider = 'none' | 'webhook'

export type TenantReview = {
  name: string
  stars: number
  text: string
}

export type TenantConfig = {
  brand: {
    name: string
    shortName: string
    logo: string
    favicon: string
    hero: string
    website: string
    catalogUrl: string
  }
  contact: {
    whatsapp: string
    phone: string
    email: string
    address: string
    mapsUrl: string
  }
  social: {
    instagram: string
    facebook: string
    youtube: string
  }
  locale: {
    language: TenantLanguage
    country: TenantCountry
    phoneCountryCode: string
  }
  currency: {
    code: TenantCurrency
    exchangeRateLabel: string
  }
  stats: {
    devicesEvaluated: number
    rating: number
    yearsExperience: number
  }
  features: {
    whatsapp: boolean
    crm: boolean
    analytics: boolean
    comparator: boolean
    tradeIn: boolean
  }
  seo: {
    title: string
    description: string
    siteUrl: string
  }
  analytics: {
    enabled: boolean
    metaPixelId: string
    clarityId: string
  }
  crm: {
    enabled: boolean
    provider: CrmProvider
    webhookUrl: string
  }
  pricingSource: {
    type: PricingSourceType
    apiUrl: string
  }
  content: {
    reviews: TenantReview[]
  }
}

export const tenant: TenantConfig = {
  brand: {
    name: 'Cotizador Demo',
    shortName: 'Demo',
    logo: '/brand/logo.svg',
    favicon: '/brand/favicon.svg',
    hero: '/brand/hero.svg',
    website: '',
    catalogUrl: '',
  },
  contact: {
    // Número de demostración (no es un WhatsApp real de un cliente).
    whatsapp: '5491156789012',
    phone: '1156789012',
    email: 'hola@example.com',
    address: 'Visitá nuestro local',
    mapsUrl: '',
  },
  social: {
    instagram: 'marca.demo',
    facebook: '',
    youtube: '',
  },
  locale: {
    language: 'es',
    country: 'AR',
    phoneCountryCode: '549',
  },
  currency: {
    code: 'USD',
    exchangeRateLabel: 'Dólar blue',
  },
  stats: {
    devicesEvaluated: 500,
    rating: 4.9,
    yearsExperience: 5,
  },
  features: {
    whatsapp: true,
    crm: false,
    analytics: false,
    comparator: true,
    tradeIn: true,
  },
  seo: {
    title: 'Cotizador',
    description: 'Cotizá tu equipo en minutos. Precio estimado al instante.',
    siteUrl: '',
  },
  analytics: {
    enabled: false,
    metaPixelId: '',
    clarityId: '',
  },
  crm: {
    enabled: false,
    provider: 'none',
    webhookUrl: '',
  },
  // Default DEMO: JSON local. Si existe VITE_PANEL_API_URL, la web usa el Admin
  // (prioridad absoluta) aunque type quede en "static".
  pricingSource: {
    type: 'static',
    apiUrl: '',
  },
  content: {
    reviews: [
      { name: 'Ana G.', stars: 5, text: 'Proceso claro y rápido. Recibí mi cotización en minutos.' },
      { name: 'Martín L.', stars: 5, text: 'Muy buena atención y el precio coincidió con lo estimado.' },
      { name: 'Lucía P.', stars: 5, text: 'Fácil de usar. Coordinamos todo por WhatsApp sin vueltas.' },
      { name: 'Diego R.', stars: 5, text: 'La cotización fue transparente y el pago, inmediato.' },
      { name: 'Camila S.', stars: 5, text: 'Recomiendo el cotizador: simple y directo.' },
      { name: 'Federico M.', stars: 5, text: 'Buen seguimiento y respuesta rápida.' },
    ],
  },
}

/** WhatsApp en formato internacional, solo dígitos. */
export function getWhatsAppNumber(): string {
  return tenant.contact.whatsapp.replace(/\D/g, '')
}

export function getWhatsAppUrl(prefilledText?: string): string {
  const phone = getWhatsAppNumber()
  const query = prefilledText ? `?text=${encodeURIComponent(prefilledText)}` : ''
  return `https://wa.me/${phone}${query}`
}

export function getInstagramHandle(): string {
  return tenant.social.instagram.replace(/^@/, '').trim()
}

export function getInstagramUrl(): string {
  const handle = getInstagramHandle()
  return handle ? `https://instagram.com/${handle}` : ''
}

export function getWebsiteUrl(): string {
  const url = tenant.brand.website.trim()
  return url || '/'
}

export function getCatalogUrl(): string {
  return tenant.brand.catalogUrl.trim()
}

export function getMapsUrl(): string {
  return tenant.contact.mapsUrl.trim()
}

/** Prefijo internacional para armar el teléfono (default AR: 549). */
export function getPhoneCountryCode(): string {
  const code = tenant.locale.phoneCountryCode.replace(/\D/g, '')
  return code || '549'
}

export function getSiteUrl(): string {
  return tenant.seo.siteUrl.trim().replace(/\/$/, '')
}

export function isCrmEnabled(): boolean {
  return tenant.features.crm && tenant.crm.enabled
}

export function getCrmWebhookUrl(): string {
  if (!isCrmEnabled()) return ''
  const fromTenant = tenant.crm.webhookUrl.trim()
  if (fromTenant) return fromTenant
  return String(import.meta.env.VITE_CRM_WEBHOOK_URL ?? '').trim()
}

/**
 * Normaliza la base del Market Admin a `…/api/v1` (sin slash final).
 * Acepta tanto `https://host` como `https://host/api/v1` (o con slash).
 */
export function normalizePanelApiBaseUrl(raw: string): string {
  let base = raw.trim().replace(/\/+$/, '')
  if (!base) return ''
  if (!/\/api\/v1$/i.test(base)) {
    base = `${base}/api/v1`
  }
  return base
}

/**
 * Base URL del Admin (`…/api/v1`).
 * Prioridad: `VITE_PANEL_API_URL` → `tenant.pricingSource.apiUrl` (si type === 'api').
 * Vacía = modo demo/estático (pricing.json / market-pricing.json).
 */
export function getPanelApiBaseUrl(): string {
  const fromEnv = String(import.meta.env.VITE_PANEL_API_URL ?? '').trim()
  if (fromEnv) return normalizePanelApiBaseUrl(fromEnv)
  if (tenant.pricingSource.type === 'api') {
    const fromTenant = tenant.pricingSource.apiUrl.trim()
    if (fromTenant) return normalizePanelApiBaseUrl(fromTenant)
  }
  return ''
}

/** True cuando el Cotizador debe tratar al Admin como fuente de verdad. */
export function isPanelApiConfigured(): boolean {
  return getPanelApiBaseUrl() !== ''
}

/** Alias: URL base del panel (incluye `/api/v1`). */
export function getPricingApiUrl(): string {
  return getPanelApiBaseUrl()
}

function upsertMeta(selector: string, attrs: Record<string, string>): void {
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value)
  }
}

export function applyTenantToDocument(): void {
  if (typeof document === 'undefined') return
  document.documentElement.lang = tenant.locale.language
  document.title = tenant.seo.title
  const description = document.querySelector('meta[name="description"]')
  if (description) description.setAttribute('content', tenant.seo.description)
  const icon = document.querySelector('link[rel="icon"]')
  if (icon) {
    icon.setAttribute('href', tenant.brand.favicon)
    icon.setAttribute('type', tenant.brand.favicon.endsWith('.svg') ? 'image/svg+xml' : 'image/png')
  }

  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: tenant.seo.title })
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: tenant.seo.description })
  const siteUrl = getSiteUrl()
  if (siteUrl) {
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: siteUrl })
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', siteUrl)
  }
}
