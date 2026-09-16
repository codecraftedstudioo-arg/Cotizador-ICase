import { Card, CardHeader, Button } from '@/components/ui'
import { useWizard } from '../hooks/use-wizard'
import { useI18n } from '@/lib/i18n'

// Icons for functionality issues
const FaceIdIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
  </svg>
)

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
)

const AudioIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
)

const ChargingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
  </svg>
)

interface FunctionalityItemProps {
  icon: React.ReactNode
  label: string
  issueLabel: string
  hasIssue: boolean
  onToggle: (hasIssue: boolean) => void
}

function FunctionalityItem({ icon, label, issueLabel, hasIssue, onToggle }: FunctionalityItemProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!hasIssue)}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer
        ${hasIssue
          ? 'border-red-500/50 bg-red-500/10'
          : 'border-line bg-surface dark:bg-white/5 hover:border-line-strong hover:bg-bg-subtle dark:hover:bg-white/10'
        }
      `}
    >
      <div className={`w-8 h-8 ${hasIssue ? 'text-red-500 dark:text-red-400' : 'text-fg-subtle'}`}>
        {icon}
      </div>
      <span className={`flex-1 text-sm text-left ${hasIssue ? 'text-fg' : 'text-fg-muted'}`}>
        {hasIssue ? issueLabel : label}
      </span>
      <div className="flex items-center gap-1">
        {hasIssue ? <XIcon /> : <CheckIcon />}
      </div>
    </button>
  )
}

/**
 * Step 4: Functionality issues
 * Toggle items that affect price
 */
export function Step4Functionality() {
  const { state, setFunctionality, nextStep } = useWizard()
  const { lang } = useI18n()

  const issues = [
    {
      key: 'faceId' as const,
      icon: <FaceIdIcon />,
      label: lang === 'es' ? 'Face ID funciona' : 'Face ID works',
      issueLabel: lang === 'es' ? 'Face ID no funciona' : 'Face ID not working',
    },
    {
      key: 'camera' as const,
      icon: <CameraIcon />,
      label: lang === 'es' ? 'Cámara funciona' : 'Camera works',
      issueLabel: lang === 'es' ? 'Cámara con problemas' : 'Camera issues',
    },
    {
      key: 'audio' as const,
      icon: <AudioIcon />,
      label: lang === 'es' ? 'Audio funciona' : 'Audio works',
      issueLabel: lang === 'es' ? 'Audio con problemas' : 'Audio issues',
    },
    {
      key: 'charging' as const,
      icon: <ChargingIcon />,
      label: lang === 'es' ? 'Carga funciona' : 'Charging works',
      issueLabel: lang === 'es' ? 'Carga con problemas' : 'Charging issues',
    },
  ]

  const hasAnyIssue = Object.values(state.functionalityIssues).some(Boolean)

  return (
    <Card>
      <CardHeader
        title={lang === 'es' ? '¿Funciona todo?' : 'Does everything work?'}
      />

      <div className="space-y-2">
        {issues.map((issue) => (
          <FunctionalityItem
            key={issue.key}
            icon={issue.icon}
            label={issue.label}
            issueLabel={issue.issueLabel}
            hasIssue={state.functionalityIssues[issue.key]}
            onToggle={(hasIssue) => setFunctionality({ [issue.key]: hasIssue })}
          />
        ))}
      </div>

      <div className={`
        mt-4 p-3 rounded-xl text-sm
        ${hasAnyIssue
          ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-200'
          : 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-200'
        }
      `}>
        {hasAnyIssue
          ? (lang === 'es'
              ? '⚠️ Los problemas seleccionados afectarán el precio final'
              : '⚠️ Selected issues will affect the final price')
          : (lang === 'es'
              ? '✓ Todo funciona correctamente'
              : '✓ Everything works correctly')
        }
      </div>

      <Button onClick={nextStep} fullWidth className="mt-6">
        {lang === 'es' ? 'Continuar' : 'Continue'}
      </Button>
    </Card>
  )
}
