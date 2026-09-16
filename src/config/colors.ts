/** Hex values for iPhone colors */
export const colorMap: Record<string, string> = {
  Orange: '#D97A32', Blue: '#5B7DBF', Silver: '#C9CDD3', Lavender: '#B4A7D6',
  Sage: '#9CB98F', 'Mist Blue': '#A8C4D8', White: '#F5F5F0', Black: '#1C1C1E',
  'Sky Blue': '#87CEEB', 'Light Gold': '#D4AF6A', 'Cloud White': '#F0EDE5',
  'Space Black': '#2C2C2E', Ultramarine: '#3F00FF', Teal: '#008080',
  Pink: '#FFB6C1', 'Soft Pink': '#F4C2C2', Green: '#A8D5BA', Yellow: '#FFD700',
}

/** Spanish color names (same as market) */
export const colorNameES: Record<string, string> = {
  Orange: 'Naranja', Blue: 'Azul', Silver: 'Plateado', Black: 'Negro',
  White: 'Blanco', Green: 'Verde', Pink: 'Rosa', Red: 'Rojo',
  Lavender: 'Lavanda', Sage: 'Verde Salvia', 'Mist Blue': 'Azul Niebla',
  'Sky Blue': 'Celeste', 'Light Gold': 'Dorado Claro', 'Cloud White': 'Blanco Nube',
  'Space Black': 'Negro Espacial', 'Soft Pink': 'Rosa Suave',
  Ultramarine: 'Ultramarino', Teal: 'Turquesa', Yellow: 'Amarillo',
}

/** Get display name for a color based on language */
export function getColorName(color: string, lang: 'es' | 'en'): string {
  return lang === 'es' ? (colorNameES[color] || color) : color
}
