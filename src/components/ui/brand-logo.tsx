import { tenant } from '@/config/tenant'

type BrandLogoSize = 'nav' | 'phone' | 'header' | 'mark'

interface BrandLogoProps {
  size?: BrandLogoSize
}

const WORDMARK_H: Record<Exclude<BrandLogoSize, 'mark'>, string> = {
  nav: 'h-8 md:h-10',
  phone: 'h-[18px] sm:h-5',
  header: 'h-10 lg:h-12',
}

const WORDMARK_MAX: Record<Exclude<BrandLogoSize, 'mark'>, string> = {
  nav: 'max-w-[220px] md:max-w-[280px]',
  phone: 'max-w-[168px] sm:max-w-[196px]',
  header: 'max-w-[240px] lg:max-w-[300px]',
}

/**
 * Logo claro / oscuro según `.dark` en <html>.
 * Ambos modos usan wordmark horizontal; el icono cuadrado queda para badges.
 */
export function BrandLogo({ size = 'nav' }: BrandLogoProps) {
  if (size === 'mark') {
    return (
      <>
        <img
          src={tenant.brand.logoMark}
          alt={tenant.brand.name}
          className="block h-full w-full object-cover dark:hidden"
        />
        <img
          src={tenant.brand.logoDarkMark}
          alt=""
          aria-hidden
          className="hidden h-full w-full object-cover dark:block"
        />
      </>
    )
  }

  const box = `block w-auto object-contain object-left ${WORDMARK_H[size]} ${WORDMARK_MAX[size]}`

  return (
    <>
      <img
        src={tenant.brand.logo}
        alt={tenant.brand.name}
        className={`${box} dark:hidden`}
      />
      <img
        src={tenant.brand.logoDark}
        alt=""
        aria-hidden
        className={`hidden dark:block ${box}`}
      />
    </>
  )
}
