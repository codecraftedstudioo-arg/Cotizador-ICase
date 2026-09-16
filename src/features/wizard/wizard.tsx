import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProgressBar } from '@/components/ui'
import { ThemeToggle } from '@/components/theme-toggle'
import { useWizard } from './hooks/use-wizard'
import { useI18n } from '@/lib/i18n'
import { useExchangeRate } from '@/lib/use-exchange-rate'
import { usePricingReady, isPanelPricingFailed } from '@/lib/pricing-source'
import {
  Step1Basics,
  Step2Condition,
  Step3Details,
  Step4Functionality,
  Step5Upgrade,
  Step6Contact,
  StepResult,
} from './steps'
import { tenant, getWhatsAppUrl, getMapsUrl } from '@/config/tenant'

const TOTAL_STEPS = 6

/**
 * iPhone 15 Pro Frame - Ultra realistic
 */
function IPhoneFrame({ children, contentRef, showRate }: { children: React.ReactNode; contentRef?: React.RefObject<HTMLDivElement | null>; showRate?: boolean }) {
  const { rate } = useExchangeRate()
  return (
    <div className="relative mx-auto w-[300px] sm:w-[350px] md:w-[390px]">
      {/* Phone shadow */}
      <div className="absolute inset-4 bg-black/40 blur-2xl rounded-[50px]" />

      {/* Outer titanium frame */}
      <div
        className="relative rounded-[48px] sm:rounded-[52px] p-[2px]"
        style={{
          background: 'linear-gradient(145deg, #5a5a5c 0%, #3d3d3f 15%, #252527 50%, #3d3d3f 85%, #5a5a5c 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Inner black bezel (hardware, siempre oscuro) */}
        <div className="bg-[#111] rounded-[46px] sm:rounded-[50px] p-[8px] sm:p-[10px]">
          {/* Screen — UI de la app: blanca en claro / negra en oscuro */}
          <div
            className="relative bg-bg rounded-[38px] sm:rounded-[42px] overflow-hidden flex flex-col h-[640px] sm:h-[700px]"
          >
            {/* Status bar area with Dynamic Island */}
            <div className="flex-shrink-0 relative h-12 sm:h-14">
              {/* Time - left (hora real para capturas) */}
              <div className="absolute left-5 top-3 text-fg text-[11px] sm:text-xs font-semibold">
                {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>

              {/* Dynamic Island - center */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2 sm:top-2.5">
                <div
                  className="bg-black rounded-[20px] w-24 sm:w-28 h-[26px] sm:h-[30px] flex items-center justify-center gap-2"
                  style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04)' }}
                >
                  <div className="w-[10px] h-[10px] rounded-full bg-[#111] flex items-center justify-center">
                    <div className="w-[6px] h-[6px] rounded-full bg-[#1a365d]/80" />
                  </div>
                  <div className="w-[8px] h-[8px] rounded-full bg-[#111]" />
                </div>
              </div>

              {/* Status icons - right */}
              <div className="absolute right-5 top-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fg" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="1" y="14" width="3" height="5" rx="0.5" />
                  <rect x="6" y="10" width="3" height="9" rx="0.5" />
                  <rect x="11" y="6" width="3" height="13" rx="0.5" />
                  <rect x="16" y="2" width="3" height="17" rx="0.5" />
                </svg>
                <div className="w-5 h-2.5 rounded-sm border border-fg flex items-center p-[1px]">
                  <div className="w-3/4 h-full bg-fg rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* App header */}
            <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 border-b border-line">
              {/* App icon estilo iOS */}
              <div className="w-9 h-9 rounded-[10px] overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src={tenant.brand.logo}
                  alt={tenant.brand.name}
                  className="w-full h-full object-contain p-0.5 bg-white"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-fg text-xs font-semibold">{tenant.brand.name}</p>
                <p className="text-fg-subtle text-[10px]">Cotizador iPhone</p>
              </div>
              {showRate && rate !== null && (
                <div className="flex-shrink-0 rounded-lg bg-fg/[0.04] border border-fg/[0.08] px-2.5 py-1.5 text-right">
                  <p className="text-[8px] uppercase tracking-wider text-fg-subtle leading-none">{tenant.currency.exchangeRateLabel}</p>
                  <p className="text-[11px] font-semibold text-green-600 dark:text-green-400 tracking-tight mt-0.5">${rate.toLocaleString('es-AR')}</p>
                  <p className="text-[9px] text-fg-subtle mt-0.5 leading-none">
                    {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    {' · '}
                    {new Date().toLocaleDateString('es-AR')}
                  </p>
                </div>
              )}
            </div>

            {/* Screen content - starts from top with padding */}
            <div ref={contentRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-5 scrollbar-thin pt-2">
              {children}
            </div>

            {/* Home indicator */}
            <div className="flex-shrink-0 flex justify-center py-2">
              <div className="w-28 sm:w-32 h-[5px] bg-fg/30 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Physical buttons */}
      <div className="hidden sm:block">
        {/* Silent switch */}
        <div className="absolute -left-[3px] top-[17%] w-[4px] h-7 rounded-l-sm bg-gradient-to-r from-[#4a4a4c] to-[#3a3a3c]" />
        {/* Volume up */}
        <div className="absolute -left-[3px] top-[25%] w-[4px] h-11 rounded-l-sm bg-gradient-to-r from-[#4a4a4c] to-[#3a3a3c]" />
        {/* Volume down */}
        <div className="absolute -left-[3px] top-[37%] w-[4px] h-11 rounded-l-sm bg-gradient-to-r from-[#4a4a4c] to-[#3a3a3c]" />
        {/* Power/Action button */}
        <div className="absolute -right-[3px] top-[26%] w-[4px] h-14 rounded-r-sm bg-gradient-to-l from-[#4a4a4c] to-[#3a3a3c]" />
      </div>
    </div>
  )
}

/**
 * Animated counter hook
 */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration])

  return count
}

/**
 * Side info panels
 */
function SideInfo({ position }: { position: 'left' | 'right' }) {
  const clientCount = useCounter(2000, 1500)
  if (position === 'left') {
    return (
      <div className="hidden lg:flex flex-col gap-4 text-right pr-8">
        <div className="space-y-1">
          <div className="flex items-center justify-end gap-2">
            <span className="text-fg-muted text-sm font-medium">Cotización instantánea</span>
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-fg-subtle text-xs">Resultado en 1 minuto</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-end gap-2">
            <span className="text-fg-muted text-sm font-medium">Mejor precio</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-fg-subtle text-xs">Garantizado del mercado</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-end gap-2">
            <span className="text-fg-muted text-sm font-medium">Pago inmediato</span>
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-fg-subtle text-xs">Efectivo o transferencia</p>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden lg:flex flex-col gap-4 text-left pl-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-fg-muted text-sm font-medium">100% Seguro</span>
        </div>
        <p className="text-fg-subtle text-xs pl-10">{tenant.contact.address || 'Local físico'}</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-fg-muted text-sm font-medium">Soporte WhatsApp</span>
        </div>
        <p className="text-fg-subtle text-xs pl-10">Respondemos en minutos</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <span className="text-fg-muted text-sm font-medium">+{clientCount} clientes</span>
        </div>
        <p className="text-fg-subtle text-xs pl-10">Confían en nosotros</p>
      </div>
    </div>
  )
}

/**
 * Wizard page component
 * Form inside iPhone mockup
 */
export function WizardPage() {
  const navigate = useNavigate()
  const { state, prevStep, canjeMode } = useWizard()
  useI18n() // Keep provider active
  // Espera a que los precios estén listos (panel o fallback estático) antes
  // de cotizar, así nunca se usa data a medio cargar.
  const pricingReady = usePricingReady()
  const { currentStep } = state
  const contentRef = useRef<HTMLDivElement>(null)
  // Scroll to top when step changes
  useEffect(() => {
    if (contentRef.current?.scrollTo) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step5Upgrade />
      case 2: return <Step1Basics />
      case 3: return <Step2Condition />
      case 4: return <Step3Details />
      case 5: return <Step4Functionality />
      case 6: return <Step6Contact />
      case 7: return <StepResult />
      default: return <Step5Upgrade />
    }
  }

  const showProgress = (currentStep > 1 || (currentStep === 1 && canjeMode)) && currentStep <= TOTAL_STEPS
  const displayStep = canjeMode ? currentStep : currentStep - 1
  const displayTotal = canjeMode ? TOTAL_STEPS : TOTAL_STEPS - 1

  // Gate: no mostramos los pasos hasta tener los precios cargados.
  if (!pricingReady) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-line-strong border-t-accent animate-spin" />
        <p className="text-fg-subtle text-sm">Cargando precios…</p>
      </div>
    )
  }

  // Decisión #1: el panel era la fuente y se cayó → NO cotizamos con precios
  // viejos; mostramos "no disponible" con CTA a WhatsApp en vez de un número.
  if (isPanelPricingFailed()) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-fg text-lg font-semibold">Cotización no disponible por el momento</p>
        <p className="text-fg-muted text-sm max-w-sm">
          Estamos teniendo un problema para cargar los precios actualizados. Escribinos y te cotizamos al toque.
        </p>
        {tenant.features.whatsapp ? (
          <a
            href={getWhatsAppUrl('Hola, quiero cotizar mi equipo.')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-green-400"
          >
            Escribinos por WhatsApp
          </a>
        ) : (
          <p className="text-fg-subtle text-sm">Volvé a intentar en unos minutos.</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-gradient-to-br dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar - same as intro */}
        <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur-xl border-b border-line">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Logo - click to go back to home. invert: negro sobre claro / blanco sobre oscuro */}
            <button
              onClick={() => navigate('/')}
              className="block overflow-visible hover:opacity-80 transition-opacity"
            >
              <img
                src={tenant.brand.logo}
                alt={tenant.brand.name}
                className="h-12 md:h-14 w-auto max-w-[200px] object-contain"
              />
            </button>

            {/* Back to home + Step indicator + Theme toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 text-fg-muted hover:text-fg text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Inicio
              </button>
              {showProgress && (
                <span className="text-fg-subtle text-sm font-medium">
                  Paso {displayStep}/{displayTotal}
                </span>
              )}
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Exchange rate banner */}
        <div className="bg-bg-subtle border-b border-line">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center text-sm text-fg-muted">
            <span>Cotizamos en ARS y USD</span>
          </div>
        </div>

        {/* iPhone mockup area with side info */}
        <main className="flex-1 flex items-center justify-center px-4 py-4">
          <div className="flex items-center justify-center gap-6 xl:gap-12">
            {/* Left side info */}
            <SideInfo position="left" />

            {/* iPhone Frame */}
            <div className="flex-shrink-0">
              <IPhoneFrame contentRef={contentRef} showRate={currentStep === 7}>
                {/* Progress bar */}
                {showProgress && (
                  <div className="mb-2">
                    <ProgressBar currentStep={displayStep} totalSteps={displayTotal} />
                  </div>
                )}

                {/* Step content */}
                <div>
                  {renderStep()}
                </div>

                {/* Navigation inside iPhone */}
                {showProgress && (
                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between px-1">
                    {currentStep > 1 ? (
                      <button
                        onClick={prevStep}
                        className="flex items-center gap-1 text-sm transition-colors text-fg-muted hover:text-fg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Atrás
                      </button>
                    ) : (
                      <div className="w-14" />
                    )}
                    <span className="text-fg-subtle text-xs">
                      {displayStep} de {displayTotal}
                    </span>
                    <div className="w-14" /> {/* Spacer for alignment */}
                  </div>
                )}
              </IPhoneFrame>

              {/* Trust badges below phone - mobile only */}
              <div className="lg:hidden mt-4 flex justify-center gap-4">
                <div className="flex items-center gap-1.5 text-fg-muted text-xs">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Pago inmediato
                </div>
                <div className="flex items-center gap-1.5 text-fg-muted text-xs">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Mejor precio
                </div>
              </div>
            </div>

            {/* Right side info */}
            <SideInfo position="right" />
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center space-y-1">
          <p className="text-fg-subtle text-xs">
            © {new Date().getFullYear()} {tenant.brand.name}
            {tenant.contact.address && (
              <>
                {' · '}
                {getMapsUrl() ? (
                  <a href={getMapsUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-fg-muted transition-colors underline">
                    {tenant.contact.address}
                  </a>
                ) : (
                  <span>{tenant.contact.address}</span>
                )}
              </>
            )}
          </p>
        </footer>
      </div>
    </div>
  )
}

// Re-export WizardProvider for App.tsx
export { WizardProvider } from './hooks/use-wizard'
