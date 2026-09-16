import { useI18n } from '@/lib/i18n'
import { tenant, getWebsiteUrl } from '@/config/tenant'

/**
 * Header with logo, language toggle, and link to main site
 */
export function Header() {
  const mainSiteUrl = getWebsiteUrl()
  const { lang, setLang, t } = useI18n()

  return (
    <header className="w-full py-3 px-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <a
          href={mainSiteUrl}
          target={mainSiteUrl.startsWith('http') ? '_blank' : undefined}
          rel={mainSiteUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="block hover:scale-105 transition-transform"
        >
          <img
            src={tenant.brand.logo}
            alt={tenant.brand.name}
            className="h-16 lg:h-20 w-auto object-contain drop-shadow-lg"
          />
        </a>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="
              px-3 py-2 rounded-xl
              bg-white/10 backdrop-blur-md
              border border-white/20
              text-sm text-white font-medium
              hover:bg-white/20
              transition-all duration-300
              flex items-center gap-1.5
            "
            title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <span className="text-base">🌐</span>
            <span className="uppercase">{lang === 'es' ? 'EN' : 'ES'}</span>
          </button>

          {tenant.brand.website && (
            <a
              href={mainSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-4 py-2 rounded-xl
                bg-white/10 backdrop-blur-md
                border border-white/20
                text-sm text-white font-medium
                hover:bg-white/20
                transition-all duration-300
                flex items-center gap-2
              "
            >
              {t('visitSite')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
