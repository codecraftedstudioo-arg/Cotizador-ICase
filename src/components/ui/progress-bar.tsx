import { useI18n } from '@/lib/i18n'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

/**
 * Progress bar showing wizard completion
 * Visual feedback of how many steps are left
 * Blanco y negro
 */
export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const { t } = useI18n()
  const progress = ((currentStep - 1) / totalSteps) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 text-sm text-fg-muted">
        <span>{t('stepOf', { current: String(currentStep), total: String(totalSteps) })}</span>
        <span>{t('completed', { percent: String(Math.round(progress)) })}</span>
      </div>
      <div className="h-2 bg-fg/15 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
