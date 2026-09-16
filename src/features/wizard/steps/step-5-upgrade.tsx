import { useState, useEffect } from 'react'
import { Card, CardHeader, Button, Select, StoragePill } from '@/components/ui'
import { useWizard } from '../hooks/use-wizard'
import { useI18n } from '@/lib/i18n'
import { useMarketPrices } from '@/lib/use-market-prices'
import { formatPrice, formatStorage } from '@/lib/pricing-engine'
import { colorMap, getColorName } from '@/config/colors'
import { tenant, getCatalogUrl } from '@/config/tenant'
import type { Model } from '@/types/market'

export function Step5Upgrade() {
  const { state, setUpgradeModel, setUpgradeStorage, setUpgradeColor, setUpgradePrice, clearUpgrade, nextStep, setCanjeMode } = useWizard()
  const { t, lang } = useI18n()
  const { models: marketModels, refresh: refreshMarket, failed: marketFailed, loading: marketLoading } = useMarketPrices()
  const marketReady = marketModels.length > 0
  // Evitar el flash del loader si el fetch llega rápido (común con pre-fetch ya en marcha)
  const [showLoader, setShowLoader] = useState(false)
  useEffect(() => {
    if (marketReady || marketFailed) { setShowLoader(false); return }
    const t = setTimeout(() => setShowLoader(true), 400)
    return () => clearTimeout(t)
  }, [marketReady, marketFailed])
  const [wantsUpgrade, setWantsUpgrade] = useState<boolean>(() => {
    if (state.upgradeModel !== null) return true
    const auto = sessionStorage.getItem('auto-canje')
    if (auto) {
      sessionStorage.removeItem('auto-canje')
      return true
    }
    return false
  })

  const selectedMarketModel: Model | undefined = marketModels.find((m) => m.name === state.upgradeModel)

  const marketModelOptions = marketModels
    .filter((m) => m.variants.some((v) => v.inStock !== false && v.priceUSD > 0))
    .map((m) => ({ value: m.name, label: m.name }))

  const upgradeStorageOptions = selectedMarketModel
    ? [...new Set(
        selectedMarketModel.variants
          .filter((v) => v.inStock !== false && v.priceUSD > 0)
          .map((v) => v.storage)
      )]
    : []

  const upgradeColorOptions = selectedMarketModel && state.upgradeStorage
    ? selectedMarketModel.variants
        .filter((v) => v.storage === state.upgradeStorage && v.inStock !== false && v.priceUSD > 0)
        .map((v) => ({ color: v.color || 'Black', price: v.priceUSD }))
    : []

  const handleJustSell = () => {
    setCanjeMode(false)
    clearUpgrade()
    nextStep()
  }

  const handleWantsUpgrade = () => {
    setCanjeMode(true)
    setWantsUpgrade(true)
  }

  return (
    <Card>
      {/* Initial choice — Plan Canje destacado + sell estándar */}
      {!wantsUpgrade && (
        <>
        <CardHeader
          title={lang === 'es' ? '¿Qué querés hacer?' : 'What do you want to do?'}
        />
        <div className="space-y-3">
          {tenant.features.tradeIn && (
          <button
            type="button"
            onClick={handleWantsUpgrade}
            className="relative w-full p-4 min-h-20 rounded-xl text-left group transition-all bg-accent hover:bg-accent-hover shadow-lg shadow-accent/30 dark:bg-green-500/15 dark:hover:bg-green-500/25 dark:border-2 dark:border-green-500 dark:shadow-[0_0_25px_-8px_rgba(34,197,94,0.5)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 dark:bg-green-500/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 12a9 9 0 0 0-15-6.7L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
                  <path d="M16 16h5v5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">
                  {lang === 'es' ? 'Plan Canje' : 'Trade-in Plan'}
                </p>
                <p className="text-xs text-white/80 dark:text-white/60 mt-0.5">
                  {lang === 'es' ? 'Usá tu iPhone como parte de pago' : 'Use your iPhone as part payment'}
                </p>
              </div>
            </div>
          </button>
          )}

          {/* Solo vender — secundario (outline) */}
          <button
            type="button"
            onClick={handleJustSell}
            className="w-full p-4 min-h-20 rounded-xl border-2 border-line bg-surface dark:bg-white/5 hover:border-accent/50 hover:bg-accent/5 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-fg group-hover:text-accent dark:group-hover:text-green-300 transition-colors">
                  {lang === 'es' ? 'Solo quiero vender' : 'I just want to sell'}
                </p>
                <p className="text-xs text-fg-subtle mt-0.5">
                  {lang === 'es' ? 'Ver mi cotización directamente' : 'See my quote directly'}
                </p>
              </div>
            </div>
          </button>

          {/* Market link button */}
          {getCatalogUrl() && (
          <a
            href={getCatalogUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-1 py-2.5 w-full rounded-xl border border-line bg-surface dark:bg-white/5 hover:bg-bg-subtle dark:hover:bg-white/8 text-fg-muted hover:text-fg text-xs transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {t('upgradeViewAll')}
          </a>
          )}
        </div>
        </>
      )}

      {/* Upgrade selection form */}
      {wantsUpgrade && (
        <div className="space-y-4 animate-fadeSlideIn">
          {/* Back to choice */}
          <button
            type="button"
            onClick={() => { setCanjeMode(false); setWantsUpgrade(false); clearUpgrade() }}
            className="flex items-center gap-1 text-sm text-fg-subtle hover:text-fg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {lang === 'es' ? 'Volver' : 'Back'}
          </button>

          {/* Market Model Select */}
          <CardHeader title={lang === 'es' ? '¿Qué iPhone querés?' : 'Which iPhone do you want?'} />
          {marketFailed ? (
            <div className="space-y-3 rounded-xl border border-line bg-bg-subtle dark:bg-white/5 p-4 text-center">
              <p className="text-sm font-medium text-fg">
                {lang === 'es' ? 'Catálogo de canje no disponible' : 'Trade-in catalog unavailable'}
              </p>
              <p className="text-xs text-fg-muted">
                {lang === 'es'
                  ? 'No pudimos cargar los modelos actualizados. Reintentá o elegí solo vender.'
                  : 'We could not load updated models. Retry or choose sell only.'}
              </p>
              <Button type="button" onClick={refreshMarket} fullWidth>
                {lang === 'es' ? 'Reintentar' : 'Retry'}
              </Button>
              <button
                type="button"
                onClick={handleJustSell}
                className="text-xs text-fg-subtle hover:text-fg-muted underline"
              >
                {lang === 'es' ? 'Continuar solo vendiendo' : 'Continue with sell only'}
              </button>
            </div>
          ) : !marketReady ? (
            <div
              onClick={showLoader || marketLoading ? refreshMarket : undefined}
              className={`space-y-2 ${showLoader ? 'cursor-pointer' : ''}`}
              aria-busy="true"
              aria-label={lang === 'es' ? 'Cargando modelos' : 'Loading models'}
            >
              <div className="h-4 w-16 rounded skeleton-shimmer" />
              <div className="h-[52px] w-full rounded-xl skeleton-shimmer" />
              {showLoader && (
                <p className="text-xs text-fg-subtle text-center pt-1">
                  {lang === 'es' ? 'Cargando modelos…' : 'Loading models…'}
                </p>
              )}
            </div>
          ) : (
            <Select
              label={lang === 'es' ? 'Modelo' : 'Model'}
              placeholder={t('upgradeSelectModel')}
              options={marketModelOptions}
              value={state.upgradeModel ?? undefined}
              onChange={setUpgradeModel}
            />
          )}

          {/* Storage Pills */}
          {state.upgradeModel && upgradeStorageOptions.length > 0 && (
            <div className="space-y-2 animate-fadeSlideIn">
              <p className="text-sm text-fg-muted font-medium">{t('upgradeStorage')}</p>
              <div className="flex flex-wrap gap-2">
                {upgradeStorageOptions.map((storage) => (
                  <StoragePill
                    key={storage}
                    value={storage}
                    selected={state.upgradeStorage === storage}
                    onClick={() => setUpgradeStorage(storage)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {state.upgradeStorage && upgradeColorOptions.length > 0 && (
            <div className="space-y-2 animate-fadeSlideIn">
              <p className="text-sm text-fg-muted font-medium">{t('upgradeColor')}</p>
              <div className="flex flex-wrap gap-2">
                {upgradeColorOptions.map(({ color, price }) => {
                  const displayName = getColorName(color, lang)
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setUpgradeColor(color)
                        setUpgradePrice(price)
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm ${
                        state.upgradeColor === color
                          ? 'border-accent bg-accent/10 text-fg'
                          : 'border-line bg-surface dark:bg-white/5 text-fg-muted hover:border-line-strong'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-line-strong flex-shrink-0"
                        style={{ backgroundColor: colorMap[color] || '#888' }}
                      />
                      {displayName}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Price summary */}
          {state.upgradePrice !== null && (
            <div className="p-3 bg-bg-subtle dark:bg-white/5 rounded-xl border border-line animate-fadeSlideIn text-center">
              <p className="text-sm text-fg-muted">
                {state.upgradeModel} {formatStorage(state.upgradeStorage!)} · {getColorName(state.upgradeColor!, lang)}
              </p>
              <p className="text-lg font-bold text-fg mt-1">{formatPrice(state.upgradePrice)}</p>
            </div>
          )}

          {/* Continue button */}
          {state.upgradePrice !== null && (
            <div className="pt-2">
              <Button onClick={nextStep} fullWidth>
                {lang === 'es' ? 'Continuar' : 'Continue'}
              </Button>
            </div>
          )}

          {/* Market link */}
          {getCatalogUrl() && (
          <a
            href={getCatalogUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-fg-subtle hover:text-fg-muted transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {t('upgradeViewAll')}
          </a>
          )}
        </div>
      )}
    </Card>
  )
}
