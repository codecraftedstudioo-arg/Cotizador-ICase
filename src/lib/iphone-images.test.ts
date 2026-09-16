import { describe, it, expect } from 'vitest'
import { getIphoneImage, modelNameToId } from './iphone-images'
import fallbackData from '@/config/market-pricing.json'
import type { MarketPricing } from '@/types/market'

// Usamos import.meta.glob de Vite para listar los archivos en build-time
// sin depender de APIs de Node (fs/path)
const imageModules = import.meta.glob('/public/iphones/*.png', { eager: true, query: '?url' })
const files = new Set(
  Object.keys(imageModules)
    .map(p => p.split('/').pop() ?? '')
    .filter(Boolean)
)

describe('modelNameToId', () => {
  it('convierte nombre simple', () => {
    expect(modelNameToId('iPhone 17')).toBe('iphone-17')
  })

  it('convierte nombre con Pro', () => {
    expect(modelNameToId('iPhone 17 Pro')).toBe('iphone-17-pro')
  })

  it('convierte nombre con Pro Max', () => {
    expect(modelNameToId('iPhone 17 Pro Max')).toBe('iphone-17-pro-max')
  })

  it('mantiene "e" de modelos como 16e', () => {
    expect(modelNameToId('iPhone 16e')).toBe('iphone-16e')
  })
})

describe('getIphoneImage', () => {
  it('genera URL con color si se pasa', () => {
    expect(getIphoneImage('iphone-17', 'Blue')).toBe('/iphones/iphone-17-blue.png')
  })

  it('genera URL sin color si no se pasa', () => {
    expect(getIphoneImage('iphone-17')).toBe('/iphones/iphone-17.png')
  })

  it('trata null como sin color', () => {
    expect(getIphoneImage('iphone-17', null)).toBe('/iphones/iphone-17.png')
  })

  it('respeta mayúsculas/minúsculas en el color', () => {
    expect(getIphoneImage('iphone-17', 'Mist Blue')).toBe('/iphones/iphone-17-mist blue.png')
  })
})

describe('Integridad de imágenes — cada color del fallback JSON debe tener imagen', () => {
  const data = fallbackData as MarketPricing

  for (const model of data.models) {
    const modelId = modelNameToId(model.name)

    it(`${model.name} tiene imagen genérica o por color`, () => {
      // Debe haber al menos una imagen del modelo (genérica o con color)
      const hasGeneric = files.has(`${modelId}.png`)
      const hasAnyVariant = model.variants.some(v => {
        if (!v.color) return false
        const colorSlug = v.color.toLowerCase()
        return files.has(`${modelId}-${colorSlug}.png`)
      })

      expect(hasGeneric || hasAnyVariant).toBe(true)
    })

    // Tests para cada color puntual (ayuda a detectar cuando un color específico no tiene imagen)
    for (const variant of model.variants) {
      if (!variant.color) continue
      const colorSlug = variant.color.toLowerCase()
      it(`${model.name} ${variant.color}: tiene imagen propia O genérica (fallback)`, () => {
        const hasSpecific = files.has(`${modelId}-${colorSlug}.png`)
        const hasGeneric = files.has(`${modelId}.png`)
        expect(hasSpecific || hasGeneric).toBe(true)
      })
    }
  }
})

describe('Casos de colores con inconsistencia API vs archivo', () => {
  it('iPhone 17 Blue tiene imagen (nombre corto de la API live)', () => {
    // La API live devuelve "Blue" pero el archivo original se llamaba "mist blue"
    expect(files.has('iphone-17-blue.png')).toBe(true)
  })

  it('iPhone 17 Mist Blue tiene imagen (nombre largo del fallback JSON)', () => {
    expect(files.has('iphone-17-mist blue.png')).toBe(true)
  })

  it('iPhone 16 Ultra tiene imagen (nombre corto de la API live)', () => {
    expect(files.has('iphone-16-ultra.png')).toBe(true)
  })

  it('iPhone 16 Ultramarine tiene imagen (nombre largo)', () => {
    expect(files.has('iphone-16-ultramarine.png')).toBe(true)
  })
})
