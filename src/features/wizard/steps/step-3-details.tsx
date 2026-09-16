import { Card, CardHeader, Button, ToggleCard } from '@/components/ui'
import { useWizard } from '../hooks/use-wizard'
import { useI18n } from '@/lib/i18n'

// Icons
const BatteryFullIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M.75 9.75a3 3 0 013-3h15a3 3 0 013 3v.038c.856.173 1.5.93 1.5 1.837v2.25c0 .907-.644 1.664-1.5 1.838v.037a3 3 0 01-3 3h-15a3 3 0 01-3-3v-6zm19.5 0a1.5 1.5 0 00-1.5-1.5h-15a1.5 1.5 0 00-1.5 1.5v6a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5v-6z" clipRule="evenodd" />
    <path d="M4.5 10.5h12v3h-12v-3z" />
  </svg>
)

const BatteryLowIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M.75 9.75a3 3 0 013-3h15a3 3 0 013 3v.038c.856.173 1.5.93 1.5 1.837v2.25c0 .907-.644 1.664-1.5 1.838v.037a3 3 0 01-3 3h-15a3 3 0 01-3-3v-6zm19.5 0a1.5 1.5 0 00-1.5-1.5h-15a1.5 1.5 0 00-1.5 1.5v6a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5v-6z" clipRule="evenodd" />
    <path d="M4.5 10.5h4v3h-4v-3z" />
  </svg>
)

const OriginalIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
)

const ReplacedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
)

/**
 * Step 3: Battery health + Original parts
 * Visual cards with icons
 */
const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
  </svg>
)

const NoBoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16" strokeWidth={2} />
  </svg>
)

export function Step3Details() {
  const { state, setBatteryHealth, setOriginalParts, setOriginalBox, nextStep } = useWizard()
  const { t, lang } = useI18n()

  // All 4 questions must be answered
  const canContinue =
    state.batteryHealth !== null &&
    state.originalParts.screen !== null &&
    state.originalParts.battery !== null &&
    state.hasOriginalBox !== null

  return (
    <Card>
      <CardHeader
        title={t('step3Title')}
      />

      <div className="space-y-6">
        {/* Battery Health */}
        <div className="space-y-3">
          <p className="text-sm text-fg-muted font-medium">
            {lang === 'es' ? 'Salud de batería' : 'Battery health'}
          </p>
          <p className="text-xs text-fg-subtle">
            {lang === 'es'
              ? 'Ajustes → Batería → Estado de la batería'
              : 'Settings → Battery → Battery Health'}
          </p>
          <div className="flex gap-3">
            <ToggleCard
              selected={state.batteryHealth === 'good'}
              onClick={() => setBatteryHealth('good')}
              icon={<BatteryFullIcon />}
              label={lang === 'es' ? '85% o más' : '85% or more'}
              isPositive={true}
            />
            <ToggleCard
              selected={state.batteryHealth === 'low'}
              onClick={() => setBatteryHealth('low')}
              icon={<BatteryLowIcon />}
              label={lang === 'es' ? 'Menos de 85%' : 'Below 85%'}
              isPositive={false}
            />
          </div>
        </div>

        {/* Original Screen */}
        <div className="space-y-3">
          <p className="text-sm text-fg-muted font-medium">
            {lang === 'es' ? '¿Pantalla original de Apple?' : 'Original Apple screen?'}
          </p>
          <div className="flex gap-3">
            <ToggleCard
              selected={state.originalParts.screen === true}
              onClick={() => setOriginalParts({ screen: true })}
              icon={<OriginalIcon />}
              label={lang === 'es' ? 'Original' : 'Original'}
              isPositive={true}
            />
            <ToggleCard
              selected={state.originalParts.screen === false}
              onClick={() => setOriginalParts({ screen: false })}
              icon={<ReplacedIcon />}
              label={lang === 'es' ? 'Cambiada' : 'Replaced'}
              isPositive={false}
            />
          </div>
        </div>

        {/* Original Battery */}
        <div className="space-y-3">
          <p className="text-sm text-fg-muted font-medium">
            {lang === 'es' ? '¿Batería original de Apple?' : 'Original Apple battery?'}
          </p>
          <div className="flex gap-3">
            <ToggleCard
              selected={state.originalParts.battery === true}
              onClick={() => setOriginalParts({ battery: true })}
              icon={<OriginalIcon />}
              label={lang === 'es' ? 'Original' : 'Original'}
              isPositive={true}
            />
            <ToggleCard
              selected={state.originalParts.battery === false}
              onClick={() => setOriginalParts({ battery: false })}
              icon={<ReplacedIcon />}
              label={lang === 'es' ? 'Cambiada' : 'Replaced'}
              isPositive={false}
            />
          </div>
        </div>

        {/* Original Box */}
        <div className="space-y-3">
          <p className="text-sm text-fg-muted font-medium">
            {lang === 'es' ? '¿Tenés la caja original?' : 'Do you have the original box?'}
          </p>
          <div className="flex gap-3">
            <ToggleCard
              selected={state.hasOriginalBox === true}
              onClick={() => setOriginalBox(true)}
              icon={<BoxIcon />}
              label={lang === 'es' ? 'Sí' : 'Yes'}
              isPositive={true}
            />
            <ToggleCard
              selected={state.hasOriginalBox === false}
              onClick={() => setOriginalBox(false)}
              icon={<NoBoxIcon />}
              label={lang === 'es' ? 'No' : 'No'}
              isPositive={false}
            />
          </div>
        </div>
      </div>

      <Button onClick={nextStep} fullWidth disabled={!canContinue} className="mt-6">
        {t('continue')}
      </Button>
    </Card>
  )
}
