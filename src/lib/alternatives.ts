import type { Model } from '@/types/market'

/**
 * Genera recomendaciones de iPhones alternativos al que eligió el cliente en Plan Canje.
 *
 * Objetivo: cuando la diferencia a pagar es alta, sugerir otros modelos del market
 * que sigan siendo un upgrade respecto al iPhone del cliente pero con menor diferencia.
 */

export interface Alternative {
  model: string
  storage: string
  color: string
  price: number
  newDiff: number
  // true si el precio varía según color para ese storage (ej: 17 Pro, 17 Pro Max).
  // En ese caso la UI muestra "Desde USD X" para indicar que puede variar.
  priceVariesByColor: boolean
}

// Jerarquía de modelos: mayor número = más nuevo/mejor.
// Dentro de una generación, el tier define la variante (base < Plus/Air < Pro < Pro Max).
interface ModelInfo {
  generation: number // 13, 14, 15, 16, 17
  tier: number       // 0=e, 1=base, 2=Plus/Air, 3=Pro, 4=Pro Max
}

function parseModelInfo(name: string): ModelInfo | null {
  // iPhone SE tiene generación especial (tratamos como generación 10, tier bajo)
  // Así siempre es "peor" que iPhone 11+
  if (/iPhone SE/i.test(name)) {
    return { generation: 10, tier: 0 }
  }

  // iPhone X / XR / XS (generación ~10, single digit equivalente)
  if (/iPhone X[RS]? Max/i.test(name)) return { generation: 10, tier: 4 }
  if (/iPhone XR/i.test(name)) return { generation: 10, tier: 2 }
  if (/iPhone XS/i.test(name)) return { generation: 10, tier: 3 }
  if (/iPhone X\b/i.test(name)) return { generation: 10, tier: 3 }

  const match = name.match(/iPhone (\d{2})\s*(mini|e|Plus|Air|Pro Max|Pro)?/i)
  if (!match) return null
  const generation = parseInt(match[1], 10)
  const variant = (match[2] ?? '').toLowerCase().trim()

  let tier: number
  switch (variant) {
    case 'mini': tier = 0; break
    case 'e': tier = 0; break
    case '': tier = 1; break // base
    case 'plus':
    case 'air': tier = 2; break
    case 'pro': tier = 3; break
    case 'pro max': tier = 4; break
    default: tier = 1
  }

  return { generation, tier }
}

/**
 * ¿El modelo candidato es un upgrade respecto al que tiene el cliente?
 * Upgrade = generación mayor, O misma generación pero tier mayor.
 * No consideramos upgrades los modelos "e" (iPhone 16e, 17e).
 */
function isUpgradeFrom(currentName: string, candidateName: string): boolean {
  const current = parseModelInfo(currentName)
  const candidate = parseModelInfo(candidateName)
  if (!current || !candidate) return false

  // Modelo "e" nunca es upgrade
  if (candidateName.toLowerCase().includes(' e') || /iPhone \d+e/i.test(candidateName)) {
    return false
  }

  // Mismo o mayor tier; si generación mayor pero tier menor, NO es upgrade verdadero
  if (candidate.generation > current.generation && candidate.tier >= current.tier) return true
  if (candidate.generation === current.generation && candidate.tier > current.tier) return true
  return false
}

/**
 * Devuelve hasta N alternativas al modelo elegido:
 * - Upgrade respecto al modelo actual del cliente
 * - Precio < precio del modelo elegido actualmente
 * - Variante en stock
 * - Ordenadas por diferencia a pagar ascendente
 */
export function getAlternatives({
  marketModels,
  currentModel,
  selectedModel,
  selectedStorage,
  selectedColor,
  selectedPrice,
  tradeInValue,
  limit = 3,
}: {
  marketModels: Model[]
  currentModel: string
  selectedModel: string
  selectedStorage?: string
  selectedColor?: string
  selectedPrice: number
  tradeInValue: number
  limit?: number
}): Alternative[] {
  const results: Alternative[] = []

  const pickBestVariant = (variants: typeof marketModels[0]['variants']) => {
    // Si hay una variante del color que eligió el cliente, preferirla (coherencia con su elección)
    if (selectedColor) {
      const sameColor = variants.filter(v => v.color === selectedColor)
      if (sameColor.length > 0) {
        return sameColor.reduce((min, v) => v.priceUSD < min.priceUSD ? v : min)
      }
    }
    // Si no, tomar la más barata
    return variants.reduce((min, v) => v.priceUSD < min.priceUSD ? v : min)
  }

  // Dado un modelo y un storage, ¿los precios varían entre colores?
  // Esto nos permite mostrar "Desde USD X" solo cuando tiene sentido (17 Pro, Pro Max).
  const priceVariesForStorage = (m: Model, storage: string): boolean => {
    const variants = m.variants.filter(v => v.storage === storage && v.inStock !== false && v.priceUSD > 0)
    if (variants.length <= 1) return false
    const prices = new Set(variants.map(v => v.priceUSD))
    return prices.size > 1
  }

  for (const m of marketModels) {
    const isSameModel = m.name === selectedModel
    const isUpgrade = isUpgradeFrom(currentModel, m.name)

    // Incluimos:
    // (a) el MISMO modelo con storage menor (más barato) — para ofrecer "la misma línea pero más accesible"
    // (b) modelos de menor gama/generación pero que siguen siendo upgrade del que tiene el cliente
    if (!isSameModel && !isUpgrade) continue

    const inStockVariants = m.variants.filter(v => v.inStock !== false && v.priceUSD > 0)
    if (inStockVariants.length === 0) continue

    if (isSameModel) {
      // Mismo modelo: tomar la variante más barata que sea < precio elegido
      const cheaper = inStockVariants.filter(v => v.priceUSD < selectedPrice)
      if (cheaper.length === 0) continue
      const best = pickBestVariant(cheaper)
      if (best.storage === selectedStorage) continue
      results.push({
        model: m.name,
        storage: best.storage,
        color: best.color ?? '',
        price: best.priceUSD,
        newDiff: best.priceUSD - tradeInValue,
        priceVariesByColor: priceVariesForStorage(m, best.storage),
      })
    } else {
      // Modelo distinto: tomar la variante más barata (con preferencia por color neutro si empata)
      const cheapest = pickBestVariant(inStockVariants)
      if (cheapest.priceUSD >= selectedPrice) continue
      results.push({
        model: m.name,
        storage: cheapest.storage,
        color: cheapest.color ?? '',
        price: cheapest.priceUSD,
        newDiff: cheapest.priceUSD - tradeInValue,
        priceVariesByColor: priceVariesForStorage(m, cheapest.storage),
      })
    }
  }

  // Ordenar priorizando:
  // 1. Mismo modelo con storage menor (downgrade mínimo)
  // 2. Tier cercano al elegido
  // 3. Generación cercana al elegido
  // 4. Diferencia a pagar ascendente
  const selectedInfo = parseModelInfo(selectedModel)
  results.sort((a, b) => {
    const aIsSame = a.model === selectedModel ? 0 : 1
    const bIsSame = b.model === selectedModel ? 0 : 1
    if (aIsSame !== bIsSame) return aIsSame - bIsSame

    if (selectedInfo) {
      const aInfo = parseModelInfo(a.model)
      const bInfo = parseModelInfo(b.model)
      const aTierDiff = aInfo ? Math.abs(aInfo.tier - selectedInfo.tier) : 99
      const bTierDiff = bInfo ? Math.abs(bInfo.tier - selectedInfo.tier) : 99
      if (aTierDiff !== bTierDiff) return aTierDiff - bTierDiff

      const aGenDiff = aInfo ? Math.abs(aInfo.generation - selectedInfo.generation) : 99
      const bGenDiff = bInfo ? Math.abs(bInfo.generation - selectedInfo.generation) : 99
      if (aGenDiff !== bGenDiff) return aGenDiff - bGenDiff
    }

    return a.newDiff - b.newDiff
  })

  return results.slice(0, limit)
}

/**
 * Umbral (en USD) a partir del cual mostramos alternativas.
 * Si la diferencia a pagar es mayor o igual a esto, el recomendador aparece.
 */
export const HIGH_DIFF_THRESHOLD_USD = 800

export function shouldShowAlternatives(diffUSD: number): boolean {
  return diffUSD >= HIGH_DIFF_THRESHOLD_USD
}
