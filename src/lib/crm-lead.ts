/**
 * Construye los campos de estado del equipo para el CRM a partir del WizardState.
 *
 * Estos campos son un agregado sobre el lead básico (nombre, teléfono, modelo,
 * canje) para que el estado del iPhone —que hoy solo viaja en el mensaje de
 * WhatsApp— también quede guardado en la ficha del contacto del CRM.
 *
 * Las etiquetas están en paridad con el mensaje de WhatsApp (whatsapp-builder.ts).
 * Se replican acá a propósito para dejar este helper aislado y testeable sin
 * tocar el builder de WhatsApp (que está en prod y no debe regresionar).
 *
 * Además de los campos sueltos (mapeables uno a uno en el CRM), se arma un campo
 * resumen `detalle_estado` con todo el estado en un solo texto: mapeando solo
 * ese campo, el CRM ya ve la info completa sin configurar cada dato por separado.
 */
import type { WizardState } from '@/features/wizard/types'

const LABELS = {
  batteryLow: 'menor a 85%',
  batteryOk: '85% o más',
  screen: { perfect: 'impecable', scratches: 'rayones visibles', cracked: 'rota/rajada' },
  back: { perfect: 'impecable', cracked: 'rota/rajada' },
  frame: { perfect: 'impecable', damaged: 'dañado' },
  faceId: 'Face ID',
  camera: 'Cámara',
  audio: 'Audio',
  charging: 'Carga',
  yes: 'sí',
  no: 'no',
  none: 'ninguno',
} as const

export interface CrmConditionFields {
  salud_bateria?: string
  estado_pantalla?: string
  estado_tapa?: string
  estado_marco?: string
  dano_liquido?: string
  fallas?: string
  pantalla_original?: string
  bateria_original?: string
  caja_original?: string
  detalle_estado?: string
}

/**
 * Mapea el estado del equipo (WizardState) a los campos de estado del CRM.
 * Los campos que el usuario no respondió se omiten (quedan undefined).
 */
export function buildCrmConditionFields(state: WizardState): CrmConditionFields {
  const fields: CrmConditionFields = {}

  if (state.batteryHealth) {
    fields.salud_bateria = state.batteryHealth === 'low' ? LABELS.batteryLow : LABELS.batteryOk
  }
  if (state.screenCondition) fields.estado_pantalla = LABELS.screen[state.screenCondition]
  if (state.backCondition) fields.estado_tapa = LABELS.back[state.backCondition]
  if (state.frameCondition) fields.estado_marco = LABELS.frame[state.frameCondition]
  if (state.hasLiquidDamage !== null) {
    fields.dano_liquido = state.hasLiquidDamage ? LABELS.yes : LABELS.no
  }

  // Fallas de funcionalidad: lista legible o "ninguno"
  const issues: string[] = []
  if (state.functionalityIssues.faceId) issues.push(LABELS.faceId)
  if (state.functionalityIssues.camera) issues.push(LABELS.camera)
  if (state.functionalityIssues.audio) issues.push(LABELS.audio)
  if (state.functionalityIssues.charging) issues.push(LABELS.charging)
  fields.fallas = issues.length > 0 ? issues.join(', ') : LABELS.none

  if (state.originalParts.screen !== null) {
    fields.pantalla_original = state.originalParts.screen ? LABELS.yes : LABELS.no
  }
  if (state.originalParts.battery !== null) {
    fields.bateria_original = state.originalParts.battery ? LABELS.yes : LABELS.no
  }
  if (state.hasOriginalBox !== null) {
    fields.caja_original = state.hasOriginalBox ? LABELS.yes : LABELS.no
  }

  // Campo resumen: todo el estado en un solo texto legible.
  const resumen: string[] = []
  if (fields.salud_bateria) resumen.push(`Batería: ${fields.salud_bateria}`)
  if (fields.estado_pantalla) resumen.push(`Pantalla: ${fields.estado_pantalla}`)
  if (fields.estado_tapa) resumen.push(`Tapa: ${fields.estado_tapa}`)
  if (fields.estado_marco) resumen.push(`Marco: ${fields.estado_marco}`)
  if (fields.dano_liquido) resumen.push(`Daño por líquido: ${fields.dano_liquido}`)
  resumen.push(`Fallas: ${fields.fallas}`)
  if (fields.pantalla_original) resumen.push(`Pantalla original: ${fields.pantalla_original}`)
  if (fields.bateria_original) resumen.push(`Batería original: ${fields.bateria_original}`)
  if (fields.caja_original) resumen.push(`Caja original: ${fields.caja_original}`)
  fields.detalle_estado = resumen.join(' | ')

  return fields
}
