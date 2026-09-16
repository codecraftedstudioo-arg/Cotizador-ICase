import { describe, it, expect } from 'vitest'
import { getAlternatives, shouldShowAlternatives, HIGH_DIFF_THRESHOLD_USD } from './alternatives'
import type { Model } from '@/types/market'

const mockMarket: Model[] = [
  {
    id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', featured: true,
    variants: [
      { storage: '256', priceUSD: 1460, direction: 'up', color: 'Silver' },
      { storage: '512', priceUSD: 1670, direction: 'up', color: 'Orange' },
    ],
  },
  {
    id: 'iphone-17-pro', name: 'iPhone 17 Pro', featured: true,
    variants: [
      { storage: '256', priceUSD: 1310, direction: 'up', color: 'Orange' },
      { storage: '256', priceUSD: 1330, direction: 'up', color: 'Blue' },
      { storage: '256', priceUSD: 1330, direction: 'up', color: 'Silver' },
      { storage: '1024', priceUSD: 1750, direction: 'up', color: 'Blue' },
    ],
  },
  {
    id: 'iphone-17-air', name: 'iPhone 17 Air', featured: false,
    variants: [
      { storage: '256', priceUSD: 990, direction: 'same', color: 'Sky Blue' },
    ],
  },
  {
    id: 'iphone-17', name: 'iPhone 17', featured: false,
    variants: [
      { storage: '256', priceUSD: 880, direction: 'up', color: 'Black' },
    ],
  },
  {
    id: 'iphone-17e', name: 'iPhone 17e', featured: false,
    variants: [
      { storage: '256', priceUSD: 690, direction: 'same', color: 'Black' },
    ],
  },
  {
    id: 'iphone-16', name: 'iPhone 16', featured: false,
    variants: [
      { storage: '128', priceUSD: 760, direction: 'same', color: 'Teal' },
    ],
  },
  {
    id: 'iphone-15', name: 'iPhone 15', featured: false,
    variants: [
      { storage: '128', priceUSD: 650, direction: 'same', color: 'Blue' },
      { storage: '256', priceUSD: 0, direction: 'same', color: 'Green', inStock: false },
    ],
  },
]

describe('getAlternatives — recomendador', () => {
  it('sugiere modelos más baratos que el elegido', () => {
    // Cliente tiene iPhone 13, eligió 17 Pro Max
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedPrice: 1460,
      tradeInValue: 200,
    })

    expect(alts.length).toBeGreaterThan(0)
    // Todas las alternativas deben ser más baratas
    alts.forEach(a => expect(a.price).toBeLessThan(1460))
  })

  it('prioriza mismo modelo con storage menor, luego tier cercano, luego diff ascendente', () => {
    // Cliente eligió 17 Pro Max 512GB. Debería sugerir primero 17 Pro Max 256GB (mismo modelo),
    // después 17 Pro (tier cercano), después modelos de tier inferior
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedStorage: '512',
      selectedPrice: 1670,
      tradeInValue: 200,
    })

    expect(alts.length).toBeGreaterThan(0)
    // El primero debe ser el mismo modelo (17 Pro Max con storage menor)
    expect(alts[0].model).toBe('iPhone 17 Pro Max')
  })

  it('respeta el limit', () => {
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedPrice: 1460,
      tradeInValue: 200,
      limit: 2,
    })
    expect(alts.length).toBeLessThanOrEqual(2)
  })

  it('no incluye modelos "e" (no son upgrade)', () => {
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedPrice: 1460,
      tradeInValue: 200,
    })
    expect(alts.some(a => a.model.toLowerCase().includes('17e'))).toBe(false)
  })

  it('no incluye variantes sin stock', () => {
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedPrice: 1460,
      tradeInValue: 200,
    })
    // iPhone 15 Green está sin stock, la alternativa para iPhone 15 debe ser la variante Blue (en stock)
    const iphone15 = alts.find(a => a.model === 'iPhone 15')
    if (iphone15) {
      expect(iphone15.color).toBe('Blue')
    }
  })

  it('no incluye downgrades', () => {
    // Cliente tiene iPhone 16 Pro, eligió 17 Pro Max (1460)
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 16 Pro',
      selectedModel: 'iPhone 17 Pro Max',
      selectedPrice: 1460,
      tradeInValue: 500,
    })
    // No debería incluir iPhone 15, 16 base, 17 base, 17 Air — son downgrades o iguales
    const noDowngrades = ['iPhone 15', 'iPhone 16', 'iPhone 17', 'iPhone 17 Air']
    noDowngrades.forEach(m => {
      expect(alts.some(a => a.model === m)).toBe(false)
    })
  })

  it('incluye upgrades de misma generación con tier mayor', () => {
    // Cliente tiene iPhone 17 (base), eligió 17 Pro Max
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 17',
      selectedModel: 'iPhone 17 Pro Max',
      selectedPrice: 1460,
      tradeInValue: 300,
    })
    // 17 Pro es upgrade respecto a 17 base (misma gen, tier mayor)
    expect(alts.some(a => a.model === 'iPhone 17 Pro')).toBe(true)
  })

  it('sugiere el mismo modelo con storage menor (mismo modelo más barato)', () => {
    // Cliente tiene iPhone 13, eligió iPhone 17 Pro Max 512GB (1670)
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedStorage: '512',
      selectedPrice: 1670,
      tradeInValue: 200,
    })
    // Debería sugerir 17 Pro Max 256GB (1460) como alternativa
    const samemodel = alts.find(a => a.model === 'iPhone 17 Pro Max')
    expect(samemodel).toBeDefined()
    expect(samemodel!.storage).toBe('256')
    expect(samemodel!.price).toBe(1460)
  })

  it('no sugiere el mismo modelo con el MISMO storage', () => {
    // Si eligió 17 Pro 256GB (1310), no debe sugerir 17 Pro 256GB
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro',
      selectedStorage: '256',
      selectedPrice: 1310,
      tradeInValue: 200,
    })
    const dup = alts.find(a => a.model === 'iPhone 17 Pro' && a.storage === '256')
    expect(dup).toBeUndefined()
  })

  it('devuelve array vacío si no hay upgrades disponibles', () => {
    // Cliente tiene el mejor modelo posible
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 17 Pro Max',
      selectedModel: 'iPhone 17 Pro Max',
      selectedPrice: 1460,
      tradeInValue: 1000,
    })
    expect(alts.length).toBe(0)
  })

  it('calcula newDiff correctamente', () => {
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedPrice: 1460,
      tradeInValue: 200,
    })
    alts.forEach(a => {
      expect(a.newDiff).toBe(a.price - 200)
    })
  })

  it('marca priceVariesByColor=true para modelos con distinto precio por color', () => {
    // iPhone 17 Pro 256GB tiene Orange 1310, Blue/Silver 1330 → varía
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedStorage: '256',
      selectedPrice: 1460,
      tradeInValue: 200,
    })
    const pro = alts.find(a => a.model === 'iPhone 17 Pro')
    if (pro) {
      expect(pro.priceVariesByColor).toBe(true)
    }
  })

  it('marca priceVariesByColor=false para modelos con mismo precio en todos los colores', () => {
    // iPhone 17 256GB: todos los colores a 880 → no varía
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedStorage: '256',
      selectedPrice: 1460,
      tradeInValue: 200,
    })
    const base17 = alts.find(a => a.model === 'iPhone 17')
    if (base17) {
      expect(base17.priceVariesByColor).toBe(false)
    }
  })
})

describe('shouldShowAlternatives', () => {
  it('true cuando diferencia supera el umbral', () => {
    expect(shouldShowAlternatives(HIGH_DIFF_THRESHOLD_USD)).toBe(true)
    expect(shouldShowAlternatives(HIGH_DIFF_THRESHOLD_USD + 100)).toBe(true)
  })

  it('false cuando diferencia es baja', () => {
    expect(shouldShowAlternatives(100)).toBe(false)
    expect(shouldShowAlternatives(HIGH_DIFF_THRESHOLD_USD - 1)).toBe(false)
  })

  it('false cuando diferencia es 0 (trade-in cubre)', () => {
    expect(shouldShowAlternatives(0)).toBe(false)
    expect(shouldShowAlternatives(-100)).toBe(false)
  })
})

describe('getAlternatives — NO debe mostrar recomendaciones en estos casos', () => {
  it('cliente tiene el iPhone más nuevo (nada es upgrade)', () => {
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 17 Pro Max',
      selectedModel: 'iPhone 17 Pro Max',
      selectedStorage: '512',
      selectedPrice: 1670,
      tradeInValue: 1000,
    })
    // Solo podría haber variantes del mismo modelo con menos storage
    alts.forEach(a => {
      expect(a.model).toBe('iPhone 17 Pro Max')
      expect(a.price).toBeLessThan(1670)
    })
  })

  it('cliente eligió el modelo más barato (no hay alternativas más baratas aún siendo upgrade)', () => {
    // Cliente iPhone 13, eligió iPhone 17e (el más barato del market)
    // Pero 17e no está en mock como upgrade... usemos iPhone 15 que es $650
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 15',
      selectedStorage: '128',
      selectedPrice: 650,
      tradeInValue: 150,
    })
    // iPhone 15 es el más barato y es upgrade de 13, no debería haber nada más barato
    // Como 13 no tiene mismo modelo para storage menor aquí, resultado vacío
    alts.forEach(a => {
      expect(a.price).toBeLessThan(650)
    })
  })

  it('cliente tiene el modelo más viejo, pero todo es upgrade', () => {
    // iPhone 13 es el más viejo. iPhone 15 ($650) es el más barato disponible.
    // Si elige iPhone 15 128GB ($650), no hay alternativas más baratas.
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 15',
      selectedStorage: '128',
      selectedPrice: 650,
      tradeInValue: 100,
    })
    // Array vacío porque no hay nada más barato
    expect(alts.length).toBe(0)
  })

  it('market vacío devuelve array vacío', () => {
    const alts = getAlternatives({
      marketModels: [],
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedPrice: 1460,
      tradeInValue: 200,
    })
    expect(alts.length).toBe(0)
  })

  it('market solo con variantes sin stock devuelve array vacío', () => {
    const outOfStockMarket: Model[] = [
      {
        id: 'iphone-17-pro', name: 'iPhone 17 Pro', featured: true,
        variants: [
          { storage: '256', priceUSD: 0, direction: 'same', color: 'Orange', inStock: false },
          { storage: '512', priceUSD: 0, direction: 'same', color: 'Blue', inStock: false },
        ],
      },
    ]
    const alts = getAlternatives({
      marketModels: outOfStockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedPrice: 1460,
      tradeInValue: 200,
    })
    expect(alts.length).toBe(0)
  })
})

describe('getAlternatives — casos del requerimiento original', () => {
  it('cliente iPhone 13 eligió 17 Pro Max: muestra 17 Pro, 17, Air', () => {
    // Este es el ejemplo específico que dio el cliente en el requerimiento
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedStorage: '256',
      selectedPrice: 1460,
      tradeInValue: 200,
    })
    const modelNames = alts.map(a => a.model)
    // Debe incluir alguna combinación de los modelos del ejemplo
    const expectedSome = ['iPhone 17 Pro', 'iPhone 17', 'iPhone 17 Air']
    const matches = expectedSome.filter(m => modelNames.includes(m))
    expect(matches.length).toBeGreaterThan(0)
  })

  it('todas las alternativas sugeridas son upgrade del modelo actual del cliente', () => {
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedStorage: '256',
      selectedPrice: 1460,
      tradeInValue: 200,
    })
    // Ninguna alternativa debería ser iPhone 13 o anterior
    alts.forEach(a => {
      expect(a.model).not.toMatch(/iPhone (12|11|X|SE)/)
    })
  })

  it('todas las alternativas tienen precio menor al modelo elegido', () => {
    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedStorage: '256',
      selectedPrice: 1460,
      tradeInValue: 200,
    })
    alts.forEach(a => {
      expect(a.price).toBeLessThan(1460)
    })
  })

  it('todas las alternativas tienen diferencia a pagar menor a la original', () => {
    const originalPrice = 1460
    const tradeIn = 200
    const originalDiff = originalPrice - tradeIn

    const alts = getAlternatives({
      marketModels: mockMarket,
      currentModel: 'iPhone 13',
      selectedModel: 'iPhone 17 Pro Max',
      selectedStorage: '256',
      selectedPrice: originalPrice,
      tradeInValue: tradeIn,
    })
    alts.forEach(a => {
      expect(a.newDiff).toBeLessThan(originalDiff)
    })
  })
})
