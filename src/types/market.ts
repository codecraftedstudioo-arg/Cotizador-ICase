export type PriceDirection = 'up' | 'down' | 'same'

export interface Variant {
  storage: string
  priceUSD: number
  direction: PriceDirection
  priceDiff?: number
  color?: string
  /** Semántica existente: disponible para canje si !== false */
  inStock?: boolean
  /** Unidades crudas del Admin (no cambia el filtro binario). */
  stock?: number
  photoUrl?: string | null
  colorHex?: string | null
}

export interface Model {
  /** Slug derivado del nombre (id estable en el cotizador). */
  id: string
  name: string
  featured: boolean
  variants: Variant[]
}

export interface MarketPricing {
  models: Model[]
  currency: string
  lastUpdated: string
}
