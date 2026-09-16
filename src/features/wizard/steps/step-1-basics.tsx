import { Card, CardHeader, Button, Select, StoragePill } from '@/components/ui'
import { useWizard } from '../hooks/use-wizard'
import { useI18n } from '@/lib/i18n'
import { getAvailableModels, getStorageForModel } from '@/lib/pricing-engine'
import type { StorageCapacity } from '../types'

/**
 * Step 1: Model (dropdown) + Storage (pills)
 */
export function Step1Basics() {
  const { state, setModel, nextStep } = useWizard()
  const { t, lang } = useI18n()

  const models = getAvailableModels()
  const modelOptions = models.map((model) => ({
    value: model,
    label: model,
  }))

  const storageOptions = state.model ? getStorageForModel(state.model) : []
  const canContinue = state.model !== null && state.storage !== null

  return (
    <Card>
      <CardHeader
        title={t('step1Title')}
      />

      <div className="space-y-4">
        {/* Model Dropdown */}
        <Select
          label={lang === 'es' ? 'Modelo' : 'Model'}
          placeholder={t('selectModel')}
          options={modelOptions}
          value={state.model ?? undefined}
          onChange={(val) => setModel(val)}
        />

        {/* Storage Pills */}
        {state.model && storageOptions.length > 0 && (
          <div className="space-y-2 animate-fadeSlideIn">
            <p className="text-sm text-fg-muted font-medium">
              {lang === 'es' ? 'Capacidad' : 'Storage'}
            </p>
            <div className="flex flex-wrap gap-2">
              {storageOptions.map((storage) => (
                <StoragePillButton
                  key={storage}
                  value={storage}
                  selected={state.storage === storage}
                  storage={storage as StorageCapacity}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Button onClick={nextStep} fullWidth disabled={!canContinue} className="mt-6">
        {t('continue')}
      </Button>
    </Card>
  )
}

// Separate component to use the hook
function StoragePillButton({ value, selected, storage }: { value: string; selected: boolean; storage: StorageCapacity }) {
  const { setStorage } = useWizard()

  return (
    <StoragePill
      value={value}
      selected={selected}
      onClick={() => setStorage(storage)}
    />
  )
}
