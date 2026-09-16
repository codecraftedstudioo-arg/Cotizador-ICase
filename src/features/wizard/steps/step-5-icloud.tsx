import { useState, useEffect } from 'react'
import { Card, CardHeader, Button, ToggleCard } from '@/components/ui'
import { useWizard } from '../hooks/use-wizard'
import { useI18n } from '@/lib/i18n'

// Icons
const CloudCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496zM15.22 11.47a.75.75 0 10-1.06 1.06l-2.47 2.47-1.47-1.47a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l3-3z" clipRule="evenodd" />
  </svg>
)

const CloudXIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496zM9.22 11.47a.75.75 0 10-1.06 1.06L10.94 15l-2.78 2.78a.75.75 0 101.06 1.06L12 16.06l2.78 2.78a.75.75 0 101.06-1.06L13.06 15l2.78-2.78a.75.75 0 00-1.06-1.06L12 13.94l-2.78-2.78z" clipRule="evenodd" />
  </svg>
)

const helpSteps = [
  {
    label: 'Abrí "Ajustes"',
    detail: 'El icono ⚙️ en tu pantalla de inicio.',
  },
  {
    label: 'Tocá tu nombre',
    detail: 'Arriba de todo, donde dice tu cuenta de Apple.',
  },
  {
    label: 'Tocá "Buscar"',
    detail: 'Dentro de la configuración de tu cuenta.',
  },
  {
    label: 'Desactivá "Buscar mi iPhone"',
    detail: 'Apagá el interruptor y confirmá con tu contraseña.',
  },
]

function WhyExplainer({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="mt-2 p-3 bg-white/[0.04] rounded-lg text-[13px] text-white/45 leading-relaxed animate-fadeSlideIn">
      Apple bloquea los iPhones que tienen "Buscar mi iPhone" activado. Si no se desactiva, el equipo no se puede usar con otra cuenta y no lo podemos comprar.
    </div>
  )
}

function HelpBottomSheet({ onClose }: { onClose: () => void }) {
  const [showWhy, setShowWhy] = useState(false)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="relative w-full sm:max-w-md bg-[#141414] sm:mb-8 sm:rounded-2xl rounded-t-2xl overflow-y-auto max-h-[88vh] animate-slideUp">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-6 pt-3 pb-7">
          {/* Header */}
          <div className="mb-7">
            <h3 className="text-[22px] font-bold text-white leading-tight">Para ver tu cotización, desactivá Buscar mi iPhone</h3>
            <p className="text-[14px] text-white/40 mt-1.5 leading-snug">
              Lleva menos de 1 minuto.
              <button
                onClick={() => setShowWhy(w => !w)}
                className="ml-1.5 text-amber-400/70 hover:text-amber-400 underline underline-offset-2 cursor-pointer transition-colors"
              >
                ¿Por qué es necesario?
              </button>
            </p>
            <WhyExplainer show={showWhy} />
          </div>

          {/* Steps */}
          <div className="space-y-5 mb-8">
            {helpSteps.map((step, i) => (
              <div key={i} className="flex gap-3.5 items-start">
                {/* Number */}
                <div className="w-8 h-8 rounded-full bg-amber-500/12 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[13px] font-bold text-amber-400">{i + 1}</span>
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[15px] font-semibold text-white/90 leading-tight">{step.label}</p>
                  <p className="text-[13px] text-white/40 mt-1 leading-snug">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-amber-500/12 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 font-semibold text-[15px] transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Step 5: iCloud / Find My iPhone check
 * If locked, quote is blocked
 */
export function Step5ICloud() {
  const { state, setICloud, nextStep } = useWizard()
  const { lang } = useI18n()
  const [showHelp, setShowHelp] = useState(false)

  const canContinue = state.iCloudOff === true

  return (
    <>
      <Card>
        <CardHeader
          title={lang === 'es' ? '¿Desactivaste Buscar mi iPhone?' : 'Did you turn off Find My iPhone?'}
        />

        {/* Help trigger */}
        <button
          onClick={() => setShowHelp(true)}
          className="w-full p-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl mb-6 flex items-center gap-3 hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-full bg-amber-500/12 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px] text-amber-400">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3.75 3.75 0 115.304 5.304l-.645.645a1.5 1.5 0 00-.439 1.061V13a.75.75 0 01-1.5 0v-.151a3 3 0 01.879-2.122l.645-.644a2.25 2.25 0 10-3.183-3.183zM10 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm text-white/50 font-medium flex-1">
            {lang === 'es' ? '¿Cómo se desactiva?' : 'How do I turn it off?'}
          </span>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/20 flex-shrink-0">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Toggle selection */}
        <div className="space-y-3">
          <p className="text-sm text-white/50 font-medium">
            {lang === 'es' ? '¿Ya lo desactivaste?' : 'Have you turned it off?'}
          </p>
          <div className="flex gap-3">
            <ToggleCard
              selected={state.iCloudOff === true}
              onClick={() => setICloud(true)}
              icon={<CloudCheckIcon />}
              label={lang === 'es' ? 'Sí, está desactivado' : 'Yes, it\'s off'}
              isPositive={true}
            />
            <ToggleCard
              selected={state.iCloudOff === false}
              onClick={() => setICloud(false)}
              icon={<CloudXIcon />}
              label={lang === 'es' ? 'No' : 'No'}
              isPositive={false}
            />
          </div>
        </div>

        {/* Status feedback */}
        {state.iCloudOff !== null && (
          <div className={`
            mt-4 p-3 rounded-xl text-sm animate-fadeSlideIn
            ${state.iCloudOff
              ? 'bg-green-500/10 border border-green-500/30 text-green-200'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
            }
          `}>
            {state.iCloudOff
              ? (lang === 'es'
                  ? '✓ Perfecto, tu iPhone puede ser cotizado'
                  : '✓ Perfect, your iPhone can be quoted')
              : (lang === 'es'
                  ? 'Necesitás desactivarlo para poder vender tu iPhone.'
                  : 'You need to turn it off to sell your iPhone.')
            }
            {state.iCloudOff === false && (
              <button
                onClick={() => setShowHelp(true)}
                className="block mt-1 text-amber-300 underline underline-offset-2 hover:text-amber-200 transition-colors cursor-pointer"
              >
                Ver cómo hacerlo
              </button>
            )}
          </div>
        )}

        <Button onClick={nextStep} fullWidth disabled={!canContinue} className="mt-6">
          {lang === 'es' ? 'Ver cotización' : 'Get quote'}
        </Button>
      </Card>

      {showHelp && <HelpBottomSheet onClose={() => setShowHelp(false)} />}
    </>
  )
}
