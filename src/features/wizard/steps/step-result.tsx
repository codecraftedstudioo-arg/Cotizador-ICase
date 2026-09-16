import { Card, Button } from '@/components/ui'
import { useWizard } from '../hooks/use-wizard'
import { useI18n } from '@/lib/i18n'
import { calculatePrice, formatPrice, formatStorage, getDisplayedOfferPrice } from '@/lib/pricing-engine'
import { buildWhatsAppLink, buildInquiryLink } from '@/lib/whatsapp-builder'
import type { UpgradeInfo } from '@/features/wizard/types'
import { useExchangeRate } from '@/lib/use-exchange-rate'
import { useState } from 'react'
import { useMarketPrices } from '@/lib/use-market-prices'
import { getAlternatives, shouldShowAlternatives, type Alternative } from '@/lib/alternatives'
import { getIphoneImage, modelNameToId } from '@/lib/iphone-images'
import { PriceComparator } from '../components/price-comparator'
import { LockedOfferBanner } from '../components/locked-offer-banner'
import { tenant } from '@/config/tenant'

/**
 * Final step: Show price or blocked message
 */
export function StepResult() {
  const { state, reset, setUpgradeAll } = useWizard()
  const { t, lang } = useI18n()
  const priceResult = calculatePrice(state)
  const { rate } = useExchangeRate()
  const { models: marketModels } = useMarketPrices()
  const contactName = state.contactName ?? ''
  // El state guarda los 10 dígitos locales; agrego prefijo +54 9 para mostrar
  const rawPhone = state.contactPhone ?? ''
  const contactPhone = rawPhone.length === 10 ? `+54 9 ${rawPhone}` : rawPhone

  // Build upgrade info from wizard state
  const upgradeInfo: UpgradeInfo | undefined =
    state.upgradeModel && state.upgradeStorage && state.upgradeColor && state.upgradePrice
      ? { model: state.upgradeModel, storage: state.upgradeStorage, color: state.upgradeColor, price: state.upgradePrice }
      : undefined

  // Blocked by iCloud
  if (priceResult?.blocked) {
    return (
      <Card className="text-center">
        <div className="py-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-fg mb-4">
            {lang === 'es' ? 'No podemos cotizar este iPhone' : 'We cannot quote this iPhone'}
          </h2>
          <p className="text-fg-muted mb-6">
            {lang === 'es'
              ? 'El iPhone tiene iCloud / Buscar mi iPhone activado. Necesitamos que lo desactives para poder comprarlo.'
              : 'The iPhone has iCloud / Find My iPhone enabled. You need to disable it for us to buy it.'}
          </p>
          <div className="p-4 bg-bg-subtle dark:bg-white/5 rounded-xl text-left mb-6">
            <p className="text-sm text-fg-muted">
              {lang === 'es'
                ? '📱 Para desactivar: Ajustes → Tu nombre → Buscar → Buscar mi iPhone → Desactivar'
                : '📱 To disable: Settings → Your Name → Find My → Find My iPhone → Turn Off'}
            </p>
          </div>
          <Button onClick={reset} fullWidth>
            {t('quoteAnother')}
          </Button>
        </div>
      </Card>
    )
  }

  // Error calculating
  if (!priceResult || !state.model) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-fg-muted">
            {lang === 'es' ? 'Error al calcular el precio' : 'Error calculating price'}
          </p>
          <Button onClick={reset} className="mt-4">
            {lang === 'es' ? 'Volver a empezar' : 'Start over'}
          </Button>
        </div>
      </Card>
    )
  }

  const contactInfo = (contactName || contactPhone)
    ? { name: contactName || undefined, phone: contactPhone || undefined }
    : undefined
  // Precios Admin = Plan Canje. En "solo venta" se aplica canjeBonus (descuento).
  const isCanje = Boolean(upgradeInfo)
  const offerFinal = getDisplayedOfferPrice(priceResult.finalPrice, isCanje ? 'canje' : 'sell')
  const offerResult = { ...priceResult, finalPrice: offerFinal }
  const whatsappLink = buildWhatsAppLink(state, offerResult, contactInfo, lang, rate ?? 0, upgradeInfo)
  const diff = upgradeInfo ? upgradeInfo.price - offerResult.finalPrice : 0
  const upgradeCovers = upgradeInfo && diff <= 0

  // Guardar el upgrade original para poder volver si cambia de opinión.
  // Persiste en sessionStorage para que sobreviva a refresh de la página.
  const [originalUpgrade, setOriginalUpgradeState] = useState<UpgradeInfo | null>(() => {
    try {
      const raw = sessionStorage.getItem('original-upgrade')
      return raw ? JSON.parse(raw) as UpgradeInfo : null
    } catch { return null }
  })
  const setOriginalUpgrade = (value: UpgradeInfo | null) => {
    setOriginalUpgradeState(value)
    try {
      if (value) sessionStorage.setItem('original-upgrade', JSON.stringify(value))
      else sessionStorage.removeItem('original-upgrade')
    } catch { /* ignore */ }
  }
  const [altsExpanded, setAltsExpanded] = useState(false)

  // Calcular alternativas si es canje, la diferencia es alta, y el usuario NO eligió una alternativa todavía.
  // Una vez que elige una, dejamos de mostrar más alternativas (solo queda el botón "Volver al original").
  const alternatives: Alternative[] = upgradeInfo && state.model && !upgradeCovers && shouldShowAlternatives(diff) && !originalUpgrade
    ? getAlternatives({
        marketModels,
        currentModel: state.model,
        selectedModel: upgradeInfo.model,
        selectedStorage: upgradeInfo.storage,
        selectedColor: upgradeInfo.color,
        selectedPrice: upgradeInfo.price,
        tradeInValue: offerResult.finalPrice,
      })
    : []

  const handleSelectAlternative = (alt: Alternative) => {
    // Guardar el upgrade actual como "original" solo la primera vez
    if (!originalUpgrade && upgradeInfo) {
      setOriginalUpgrade(upgradeInfo)
    }
    // Update atómico: evita que por un frame queden campos null y se renderice el flujo de venta
    setUpgradeAll({ model: alt.model, storage: alt.storage, color: alt.color, price: alt.price })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRestoreOriginal = () => {
    if (!originalUpgrade) return
    setUpgradeAll({
      model: originalUpgrade.model,
      storage: originalUpgrade.storage,
      color: originalUpgrade.color,
      price: originalUpgrade.price,
    })
    setOriginalUpgrade(null)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deductionsBlock = priceResult.deductionBreakdown.length > 0 ? (
    <div className="mb-4 p-4 bg-bg-subtle dark:bg-white/5 rounded-xl text-left border border-line">
      <p className="text-sm font-medium text-fg mb-3">{t('adjustments')}</p>
      <ul className="space-y-2">
        {priceResult.deductionBreakdown.map((d, i) => (
          <li key={i} className="text-sm flex justify-between items-center">
            <span className="text-fg-muted">{t(d.reason as any)}</span>
            <span className="text-fg font-medium">-{formatPrice(d.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : null

  return (
    <Card className="text-center">
      <Confetti />

      {upgradeInfo ? (
        <>
          {/* Upgrade flow */}
          <div className="mb-4 space-y-3 text-center">
            {/* Your iPhone value */}
            <div className="p-4 min-h-[5rem] flex flex-col justify-center bg-green-500/10 rounded-xl border border-green-500/20">
              <p className="text-green-700/70 dark:text-green-300/60 text-xs">
                {lang === 'es' ? `Tu ${state.model} ${formatStorage(state.storage ?? '')} vale` : `Your ${state.model} ${formatStorage(state.storage ?? '')} is worth`}
              </p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-0.5">{formatPrice(offerResult.finalPrice)}</p>
            </div>

            {/* New iPhone price */}
            <div className="p-4 min-h-[5rem] flex flex-col justify-center bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-blue-700/70 dark:text-blue-300/60 text-xs">{upgradeInfo.model} {formatStorage(upgradeInfo.storage)}</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-300 mt-0.5">{formatPrice(upgradeInfo.price)}</p>
            </div>

            {/* Difference */}
            <div className="p-4 min-h-[5rem] flex flex-col justify-center bg-fg/[0.06] dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5 rounded-xl border border-line">
              <p className="text-fg-muted text-xs">
                {upgradeCovers
                  ? (lang === 'es' ? 'Te queda a favor' : 'In your favor')
                  : (lang === 'es' ? 'Diferencia a pagar' : 'Difference to pay')}
              </p>
              <p className="text-2xl font-black text-fg mt-1 animate-countUp">
                {formatPrice(Math.abs(diff))}
              </p>
              {rate !== null && Math.abs(diff) > 0 && (
                <p className="text-lg font-bold text-fg-muted mt-1">
                  {(Math.abs(diff) * rate).toLocaleString('es-AR')} ARS
                </p>
              )}
            </div>

            <p className="text-fg-subtle text-xs">{t('resultDisclaimer')}</p>
          </div>

          {deductionsBlock}

          {/* Botón para volver al modelo original si ya eligió una alternativa */}
          {originalUpgrade && (
            <button
              onClick={handleRestoreOriginal}
              className="mb-4 inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg transition-colors animate-fadeSlideIn"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {lang === 'es'
                ? `Volver a ${originalUpgrade.model} ${formatStorage(originalUpgrade.storage)}`
                : `Back to ${originalUpgrade.model} ${formatStorage(originalUpgrade.storage)}`}
            </button>
          )}

          {/* Recomendador de alternativas — solo si la diferencia es alta */}
          {alternatives.length > 0 && (
            <div className="mb-4 space-y-3 animate-fadeSlideIn">
              <button
                onClick={() => setAltsExpanded(v => !v)}
                className="w-full text-left group"
                aria-expanded={altsExpanded}
              >
                <div className={`relative flex items-center justify-between gap-3 p-3.5 rounded-xl border bg-green-500/[0.08] hover:bg-green-500/[0.15] transition-all ${
                  altsExpanded ? 'border-green-500/50' : 'border-green-500/40 shadow-[0_0_20px_-4px_rgba(34,197,94,0.3)] animate-pulse-subtle'
                }`}>
                  <div className="flex items-start gap-2.5 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-fg">
                        {lang === 'es' ? '¿Querés pagar menos diferencia?' : 'Want to pay less difference?'}
                      </p>
                      <p className="text-xs text-fg-muted mt-0.5">
                        {lang === 'es'
                          ? `Mirá ${alternatives.length} ${alternatives.length === 1 ? 'alternativa' : 'alternativas'} más accesibles`
                          : `See ${alternatives.length} more accessible ${alternatives.length === 1 ? 'alternative' : 'alternatives'}`}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-green-600 dark:text-green-400 transition-transform flex-shrink-0 ${altsExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {altsExpanded && (
              <div className="space-y-2 animate-fadeSlideIn">
                {alternatives.map((alt) => {
                  const imgSrc = getIphoneImage(modelNameToId(alt.model), alt.color || null)
                  const diffLabel = alt.newDiff <= 0
                    ? (lang === 'es' ? 'Te queda a favor' : 'In your favor')
                    : alt.priceVariesByColor
                      ? (lang === 'es' ? 'Diferencia desde' : 'Difference from')
                      : (lang === 'es' ? 'Diferencia a pagar' : 'Difference to pay')
                  return (
                    <button
                      key={`${alt.model}-${alt.storage}-${alt.color}`}
                      onClick={() => handleSelectAlternative(alt)}
                      className="w-full p-3.5 sm:p-4 rounded-xl border border-line bg-surface dark:bg-white/5 hover:bg-green-500/10 hover:border-green-500/40 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-bg-subtle dark:bg-white/5 border border-line flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img
                            src={imgSrc}
                            alt={alt.model}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement
                              const fallback = getIphoneImage(modelNameToId(alt.model))
                              if (img.src !== new URL(fallback, window.location.origin).href) {
                                img.src = fallback
                              } else {
                                img.style.display = 'none'
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-fg leading-tight">
                            {alt.model}
                          </p>
                          <p className="text-xs text-fg-muted mt-1 leading-tight">
                            {formatStorage(alt.storage)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] sm:text-xs text-fg-muted leading-tight">
                            {diffLabel}
                          </p>
                          <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 leading-tight mt-0.5">
                            {formatPrice(Math.abs(alt.newDiff))}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Sell-only flow: sticky header */}
          <div className="sticky top-0 z-10 bg-bg -mx-3 px-3 -mt-2 pt-6 pb-4 mb-4 border-b border-line shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-center">
            <p className="text-fg-muted text-sm mb-1">
              {lang === 'es' ? `Tu ${state.model} de ${formatStorage(state.storage ?? '')} vale` : `Your ${state.model} ${formatStorage(state.storage ?? '')} is worth`}
            </p>
            <p className="text-3xl sm:text-4xl font-black text-fg tracking-tight animate-countUp">
              {formatPrice(offerResult.finalPrice)}
            </p>
            {rate !== null && (
              <p className="text-xl sm:text-2xl font-bold text-fg-muted mt-1">
                {(offerResult.finalPrice * rate).toLocaleString('es-AR')} ARS
              </p>
            )}
            <p className="text-fg-subtle text-xs mt-1">{t('resultDisclaimer')}</p>
          </div>
        </>
      )}


      {/* Oferta bloqueada — countdown 24h + Comparador */}
      <div className="mb-4 -mx-3 space-y-2">
        <LockedOfferBanner />
        {tenant.features.comparator && (
          <PriceComparator ourPrice={offerResult.finalPrice} />
        )}
      </div>

      {/* Deductions breakdown — solo para venta (en canje ya se muestra arriba del recomendador) */}
      {!upgradeInfo && deductionsBlock}

      {/* Main CTA — changes text based on upgrade */}
      {tenant.features.whatsapp && (
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onClick={(e) => {
          e.preventDefault()
          setTimeout(() => window.open(whatsappLink, '_blank', 'noopener,noreferrer'), 300)
        }}
      >
        <button className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
          <WhatsAppIcon />
          {upgradeInfo
            ? (lang === 'es' ? '¡Quiero canjear!' : 'I want to trade in!')
            : (lang === 'es' ? '¡Vender mi iPhone!' : 'Sell my iPhone!')}
        </button>
      </a>
      )}

      {tenant.features.whatsapp && (
        <>
          <p className="text-center text-fg-subtle text-xs mt-3">
            {lang === 'es'
              ? 'Te responderemos en minutos por WhatsApp'
              : 'We\'ll reply within minutes on WhatsApp'}
          </p>
          <a
            href={buildInquiryLink(state, offerResult, { name: contactName || undefined, phone: contactPhone || undefined }, lang, rate ?? 0, upgradeInfo)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block w-full text-center px-4 py-3 text-sm font-semibold text-fg-muted hover:text-fg border border-line hover:border-line-strong rounded-xl transition-all"
          >
            {lang === 'es' ? '¿Tenés dudas? Consultanos' : 'Questions? Ask us'}
          </a>
        </>
      )}

      <button
        onClick={reset}
        className="mt-4 flex items-center justify-center gap-1.5 text-fg-subtle hover:text-fg-muted text-xs transition-colors mx-auto underline underline-offset-2 decoration-fg/20 hover:decoration-fg/40"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {upgradeInfo
          ? (lang === 'es' ? 'Cotizar otro iPhone' : 'Quote another iPhone')
          : t('quoteAnother')}
      </button>

    </Card>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

const Confetti = (() => {
  // Colores tipo piñata/fiesta
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA', '#FF9F43', '#6BCB77']
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 10 + 5,
    isRound: Math.random() > 0.5,
  }))

  return function ConfettiComponent() {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden animate-confetti-container">
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className="confetti-piece"
            style={{
              left: piece.left,
              animationDelay: piece.delay,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.isRound ? '50%' : '0',
            }}
          />
        ))}
      </div>
    )
  }
})()
