import type { MarketPricing, Model, Variant } from '@/types/market'
import { getPanelApiBaseUrl } from '@/config/tenant'
import staticMarket from '@/config/market-pricing.json'

const APPS_SCRIPT_URL = String(import.meta.env.VITE_MARKET_PRICES_URL ?? '').trim()
const CACHE_DURATION_MS = 5 * 60 * 1000

let cachedData: MarketPricing | null = null
let cacheTimestamp = 0
let inflight: Promise<MarketPricing> | null = null
let marketFailed = false

/** True si el Admin era la fuente del catálogo y la petición falló. */
export function isMarketCatalogFailed(): boolean {
  return marketFailed
}

// --- Panel Admin: items planos → models agrupados (espejo del market) ---

type PanelMarketItem = {
  model: string
  featured?: boolean
  color: string
  photoUrl?: string | null
  colorHex?: string | null
  storage: string
  priceUsd: number
  stock: number
  direction?: 'up' | 'down' | 'same'
  priceDiff?: number
}

function slugifyModel(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function transformPanelToMarket(items: PanelMarketItem[]): MarketPricing {
  const byModel = new Map<string, { name: string; featured: boolean; variants: Variant[] }>()

  for (const it of items) {
    let m = byModel.get(it.model)
    if (!m) {
      m = { name: it.model, featured: !!it.featured, variants: [] }
      byModel.set(it.model, m)
    }
    m.variants.push({
      storage: it.storage,
      color: it.color,
      priceUSD: it.priceUsd,
      // Semántica existente: stock>0 → disponible; no cambiamos a "unidades reales" en UI.
      stock: it.stock,
      inStock: it.stock > 0,
      photoUrl: it.photoUrl ?? null,
      colorHex: it.colorHex ?? null,
      direction: it.direction ?? 'same',
      priceDiff: it.priceDiff ?? 0,
    })
  }

  const models: Model[] = Array.from(byModel.values()).map((m) => ({
    id: slugifyModel(m.name),
    name: m.name,
    featured: m.featured,
    variants: m.variants,
  }))

  return {
    models,
    currency: 'USD',
    lastUpdated: new Date().toISOString().slice(0, 10),
  }
}

async function fetchFromPanel(panelBase: string): Promise<MarketPricing> {
  const url = `${panelBase}/market-items`
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = await response.json()
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('Datos del panel inválidos')
  }
  return transformPanelToMarket(data.items as PanelMarketItem[])
}

async function fetchFromAppsScript(): Promise<MarketPricing> {
  if (!APPS_SCRIPT_URL) {
    throw new Error('VITE_MARKET_PRICES_URL not configured')
  }
  const url = `${APPS_SCRIPT_URL}${APPS_SCRIPT_URL.includes('?') ? '&' : '?'}t=${Date.now()}`
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const data: MarketPricing = await response.json()
  if (!data.models || !Array.isArray(data.models) || data.models.length === 0) {
    throw new Error('Invalid data format')
  }
  return data
}

/**
 * Catálogo Market (Plan Canje / upgrade).
 * Con Admin: SOLO /api/v1/market-items (sin Apps Script ni JSON).
 * Sin Admin: Apps Script → market-pricing.json (demo/legacy).
 */
export async function fetchMarketPrices(): Promise<MarketPricing> {
  if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION_MS && !marketFailed) {
    return cachedData
  }

  if (inflight) return inflight

  inflight = (async () => {
    try {
      const panelBase = getPanelApiBaseUrl()
      let data: MarketPricing
      if (panelBase) {
        data = await fetchFromPanel(panelBase)
      } else if (APPS_SCRIPT_URL) {
        data = await fetchFromAppsScript()
      } else {
        data = staticMarket as MarketPricing
      }

      cachedData = data
      cacheTimestamp = Date.now()
      marketFailed = false
      return data
    } catch (err) {
      const panelBase = getPanelApiBaseUrl()
      if (panelBase) {
        marketFailed = true
        cachedData = null
        cacheTimestamp = 0
        console.warn('[market] API del Admin no disponible:', err)
      }
      throw err
    } finally {
      inflight = null
    }
  })()

  return inflight
}
