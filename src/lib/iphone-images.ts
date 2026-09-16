/**
 * Maps model ID + color to iPhone product image path.
 * Images go in /public/iphones/ with naming: {model-id}-{color}.png
 */

const BASE = '/iphones'

export function getIphoneImage(modelId: string, color?: string | null): string {
  if (color) {
    const colorSlug = color.toLowerCase()
    return `${BASE}/${modelId}-${colorSlug}.png`
  }
  return `${BASE}/${modelId}.png`
}

/**
 * Convierte nombre de modelo a id (ej: "iPhone 17 Pro" → "iphone-17-pro").
 */
export function modelNameToId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}
