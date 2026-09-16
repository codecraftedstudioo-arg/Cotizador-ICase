import { useExchangeRate } from '@/lib/use-exchange-rate'
import { tenant } from '@/config/tenant'

interface PriceComparatorProps {
  /** Precio final (USD) del negocio configurado en el tenant */
  ourPrice: number
}

/** Format a USD amount as ARS with thousand separator (e.g. $232.500) */
function toARS(usd: number, rate: number): string {
  const ars = Math.round((usd * rate) / 1000) * 1000
  return `$${ars.toLocaleString('es-AR')}`
}

type Competitor = {
  name: string
  priceFactor: number
  payTime: string
  cons: string[]
  badge: React.ReactNode
}

/** MercadoLibre */
function MLBadge() {
  return (
    <div
      className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{
        background: '#FFE600',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }}
      title="MercadoLibre"
    >
      <img
        src="/ml-app-icon.svg"
        alt="MercadoLibre"
        className="w-full h-full object-contain"
      />
    </div>
  )
}

/** Facebook Marketplace */
function FbBadge() {
  return (
    <div
      className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{
        background: '#1877F2',
        boxShadow: '0 1px 4px rgba(24,119,242,0.4)',
      }}
      title="Facebook Marketplace"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
      </svg>
    </div>
  )
}

function BrandBadge() {
  return (
    <div
      className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-line dark:ring-white/15 bg-surface"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      <img src={tenant.brand.logo} alt={tenant.brand.name} className="w-full h-full object-contain p-0.5" />
    </div>
  )
}

const COMPETITORS: Competitor[] = [
  {
    name: 'MercadoLibre',
    priceFactor: 0.8,
    payTime: '5-10 días',
    cons: ['15% comisión'],
    badge: <MLBadge />,
  },
  {
    name: 'Facebook Marketplace',
    priceFactor: 0.6,
    payTime: '1-4 semanas',
    cons: ['Sin garantía'],
    badge: <FbBadge />,
  },
]

export function PriceComparator({ ourPrice }: PriceComparatorProps) {
  const { rate } = useExchangeRate()
  // No fallback de dolar: si todavia no cargo el tipo de cambio real, no mostrar
  if (!rate) return null
  return (
    <div className="rounded-xl overflow-hidden border border-line bg-bg-subtle dark:bg-white/[0.02] text-left">
      <div className="px-3 py-2 border-b border-line">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
          Compará con otros
        </p>
      </div>

      {/* Oferta del negocio — preseleccionada */}
      {(() => {
        const ourPriceARS = Math.round((ourPrice * rate) / 1000) * 1000
        const worstCompetitorARS = Math.min(...COMPETITORS.map((c) => Math.round((ourPrice * c.priceFactor * rate) / 1000) * 1000))
        const maxSavingsARS = ourPriceARS - worstCompetitorARS
        return (
          <div className="relative px-3 py-3 border-b border-green-500/40 bg-green-500/[0.08] ring-1 ring-green-500/30 ring-inset">
            <div className="flex items-center gap-2">
              <BrandBadge />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-fg text-[13px] font-semibold leading-tight truncate">{tenant.brand.name}</p>
                  <p className="text-fg font-bold text-[14px] leading-tight tabular-nums whitespace-nowrap">
                    {toARS(ourPrice, rate)}
                  </p>
                </div>
                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                  <p className="text-[10px] text-fg-muted leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    Inmediato · 0% comisión
                  </p>
                  <p className="text-[10px] text-green-600 dark:text-green-400 leading-tight font-bold tabular-nums whitespace-nowrap">
                    +${maxSavingsARS.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {COMPETITORS.map((comp) => {
        const compPriceARS = Math.round((ourPrice * comp.priceFactor * rate) / 1000) * 1000
        const ourPriceARS = Math.round((ourPrice * rate) / 1000) * 1000
        const diffARS = ourPriceARS - compPriceARS
        return (
          <div key={comp.name} className="px-3 py-3 border-b last:border-b-0 border-line">
            <div className="flex items-center gap-2">
              {comp.badge}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-fg-muted text-[13px] font-medium leading-tight break-words">{comp.name}</p>
                  <p className="text-fg-muted font-semibold text-[14px] leading-tight tabular-nums whitespace-nowrap">
                    {`$${compPriceARS.toLocaleString('es-AR')}`}
                  </p>
                </div>
                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                  <p className="text-[10px] text-fg-subtle leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    {comp.payTime} · {comp.cons.join(' · ')}
                  </p>
                  <p className="text-[10px] text-red-500 dark:text-red-400 leading-tight font-semibold tabular-nums whitespace-nowrap">
                    −${diffARS.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Disclaimer */}
      <div className="px-3 py-2 bg-fg/[0.02]">
        <p className="text-[10px] text-fg-subtle leading-tight">
          * Precios estimados después de comisiones y demoras
        </p>
      </div>
    </div>
  )
}
