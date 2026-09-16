import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Language = 'es' | 'en'

const translations = {
  es: {
    // Intro screen
    introTitle: 'Vendé tu iPhone',
    introSubtitle: 'Cotizá en segundos y cobrá al instante. El mejor precio del mercado.',
    introCta: 'Cotizar ahora',
    badgeInstant: 'Pago inmediato',
    badgeSecure: 'Transacción segura',
    badgeLocation: 'Visitá nuestro local',
    introFooter: '',

    // Header & general
    title: '¿Cuánto vale tu iPhone?',
    subtitle: 'Cotizá en menos de 1 minuto · Pago inmediato',
    visitSite: 'Visitá nuestro sitio',
    howToGet: 'Cómo llegar',
    quoteAnother: 'Cotizar otro iPhone',
    continue: 'Continuar',
    back: 'Volver',
    stepOf: 'Paso {current} de {total}',
    completed: '{percent}% completado',

    // Step 1 - Basics
    step1Title: '¿Qué iPhone tenés?',
    step1Subtitle: 'Empecemos por lo básico',
    selectModel: 'Seleccioná tu modelo',
    selectStorage: 'Capacidad',
    storage1TB: '1 TB',

    // Step 2 - Condition
    step2Title: '¿En qué estado está?',
    step2Subtitle: 'Esto nos ayuda a darte un precio justo',
    batteryQuestion: '¿La batería está por debajo del 80%?',
    batteryYes: 'Sí, menor a 80%',
    batteryNo: 'No, 80% o más',
    screenQuestion: '¿Cómo está la pantalla?',
    screenPerfect: 'Perfecta',
    screenMinor: 'Rayones leves',
    screenCracked: 'Rajada/rota',

    // Step 3 - Details
    step3Title: 'Últimos detalles',
    step3Subtitle: 'Ya casi terminamos',
    functionalityQuestion: '¿Tiene algún problema de funcionamiento?',
    faceId: 'Face ID no funciona',
    camera: 'Cámara con problemas',
    audio: 'Audio/parlantes con fallas',
    noIssues: 'Todo funciona correctamente',
    partsQuestion: '¿Tiene piezas no originales?',
    partsYes: 'Sí, tiene piezas cambiadas',
    partsNo: 'No, todo original',
    aestheticQuestion: '¿Cómo está el estado estético general?',
    aestheticPerfect: 'Impecable',
    aestheticMinor: 'Detalles leves',
    aestheticDamage: 'Golpes visibles',

    // Result
    resultTitle: 'Tu {model} vale aproximadamente',
    resultDisclaimer: '*Precio estimado sujeto a revisión física',
    adjustments: 'Ajustes aplicados:',
    contactInfo: '¿Tenés dudas? Te contactamos sin compromiso.',
    optional: '(opcional)',
    yourName: 'Tu nombre',
    yourPhone: 'Tu teléfono',
    previewMessage: 'Ver mensaje que se enviará',
    contactWhatsApp: 'Contactar por WhatsApp',

    // WhatsApp message
    waGreeting: '¡Hola! Quiero vender mi iPhone.',
    waName: 'Nombre:',
    waPhone: 'Teléfono:',
    waModel: 'Modelo:',
    waStorage: 'Almacenamiento:',
    waBattery: 'Batería:',
    waBatteryLow: 'Menor a 80%',
    waBatteryOk: '80% o más',
    waScreen: 'Pantalla:',
    waIssues: 'Problemas:',
    waNoIssues: 'Ninguno',
    waParts: 'Piezas originales:',
    waPartsYes: 'Sí',
    waPartsNo: 'No',
    waAesthetic: 'Estado estético:',
    waQuote: 'Cotización:',
    waCoordinate: '¿Podemos coordinar?',

    // Deductions
    deductScreenCracked: 'Pantalla rajada/rota',
    deductScreenScratches: 'Pantalla con rayones',
    deductBackCracked: 'Tapa trasera rota',
    deductFrameDamaged: 'Marco/chasis dañado',
    deductLiquidDamage: 'Daño por líquido',
    deductBatteryLow: 'Batería menor a 85%',
    deductBatteryNotOriginal: 'Batería no original',
    deductScreenNotOriginal: 'Pantalla no original',
    deductFaceId: 'Face ID no funciona',
    deductTrueTone: 'True Tone no funciona',
    deductCamera: 'Problemas de cámara',
    deductAudio: 'Problemas de audio',
    deductCharging: 'Problemas de carga',
    deductNoOriginalBox: 'Sin caja original',

    // Upgrade section
    upgradeTitle: '¿Qué iPhone querés?',
    upgradeSubtitle: 'Elegí el modelo que te gustaría tener',
    upgradeSelectModel: 'Elegí un modelo',
    upgradeStorage: 'Capacidad',
    upgradeColor: 'Color',
    upgradePrice: 'Precio',
    upgradeViewAll: 'Ver modelos y precios',
    upgradeOptional: '(opcional)',
    upgradeNewPhone: 'iPhone que querés',
    upgradeYourQuote: 'Tu cotización',
    upgradeDifference: 'Diferencia a pagar',
    upgradeCovers: '¡Tu iPhone cubre el costo!',
    upgradeLoading: 'Cargando precios...',
  },
  en: {
    // Intro screen
    introTitle: 'Sell your iPhone',
    introSubtitle: 'Get a quote in seconds and get paid instantly. Best market price.',
    introCta: 'Get quote',
    badgeInstant: 'Instant payment',
    badgeSecure: 'Secure transaction',
    badgeLocation: 'Visit our store',
    introFooter: '',

    // Header & general
    title: 'How much is your iPhone worth?',
    subtitle: 'Get a quote in less than 1 minute · Instant payment',
    visitSite: 'Visit our site',
    howToGet: 'Get directions',
    quoteAnother: 'Quote another iPhone',
    continue: 'Continue',
    back: 'Back',
    stepOf: 'Step {current} of {total}',
    completed: '{percent}% complete',

    // Step 1 - Basics
    step1Title: 'Which iPhone do you have?',
    step1Subtitle: "Let's start with the basics",
    selectModel: 'Select your model',
    selectStorage: 'Storage',
    storage1TB: '1 TB',

    // Step 2 - Condition
    step2Title: "What's its condition?",
    step2Subtitle: 'This helps us give you a fair price',
    batteryQuestion: 'Is the battery below 80%?',
    batteryYes: 'Yes, below 80%',
    batteryNo: 'No, 80% or more',
    screenQuestion: 'How is the screen?',
    screenPerfect: 'Perfect',
    screenMinor: 'Minor scratches',
    screenCracked: 'Cracked/broken',

    // Step 3 - Details
    step3Title: 'Final details',
    step3Subtitle: 'Almost done',
    functionalityQuestion: 'Does it have any functionality issues?',
    faceId: 'Face ID not working',
    camera: 'Camera issues',
    audio: 'Audio/speaker problems',
    noIssues: 'Everything works fine',
    partsQuestion: 'Does it have non-original parts?',
    partsYes: 'Yes, has replaced parts',
    partsNo: 'No, all original',
    aestheticQuestion: 'What is the overall aesthetic condition?',
    aestheticPerfect: 'Pristine',
    aestheticMinor: 'Minor details',
    aestheticDamage: 'Visible damage',

    // Result
    resultTitle: 'Your {model} is worth approximately',
    resultDisclaimer: '*Estimated price subject to physical inspection',
    adjustments: 'Adjustments applied:',
    contactInfo: 'Leave your contact info',
    optional: '(optional)',
    yourName: 'Your name',
    yourPhone: 'Your phone',
    previewMessage: 'Preview message to be sent',
    contactWhatsApp: 'Contact via WhatsApp',

    // WhatsApp message
    waGreeting: 'Hi! I want to sell my iPhone.',
    waName: 'Name:',
    waPhone: 'Phone:',
    waModel: 'Model:',
    waStorage: 'Storage:',
    waBattery: 'Battery:',
    waBatteryLow: 'Below 80%',
    waBatteryOk: '80% or more',
    waScreen: 'Screen:',
    waIssues: 'Issues:',
    waNoIssues: 'None',
    waParts: 'Original parts:',
    waPartsYes: 'Yes',
    waPartsNo: 'No',
    waAesthetic: 'Aesthetic condition:',
    waQuote: 'Quote:',
    waCoordinate: 'Can we coordinate?',

    // Deductions
    deductScreenCracked: 'Cracked/broken screen',
    deductScreenScratches: 'Screen with scratches',
    deductBackCracked: 'Cracked back glass',
    deductFrameDamaged: 'Damaged frame/chassis',
    deductLiquidDamage: 'Liquid damage',
    deductBatteryLow: 'Battery below 85%',
    deductBatteryNotOriginal: 'Non-original battery',
    deductScreenNotOriginal: 'Non-original screen',
    deductFaceId: 'Face ID not working',
    deductTrueTone: 'True Tone not working',
    deductCamera: 'Camera issues',
    deductAudio: 'Audio issues',
    deductCharging: 'Charging issues',
    deductNoOriginalBox: 'No original box',

    // Upgrade section
    upgradeTitle: 'Which iPhone do you want?',
    upgradeSubtitle: 'Choose the model you\'d like to have',
    upgradeSelectModel: 'Choose a model',
    upgradeStorage: 'Storage',
    upgradeColor: 'Color',
    upgradePrice: 'Price',
    upgradeViewAll: 'View models and prices',
    upgradeOptional: '(optional)',
    upgradeNewPhone: 'iPhone you want',
    upgradeYourQuote: 'Your quote',
    upgradeDifference: 'Difference to pay',
    upgradeCovers: 'Your iPhone covers the cost!',
    upgradeLoading: 'Loading prices...',
  },
} as const

export type TranslationKey = keyof typeof translations.es

interface I18nContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: TranslationKey, replacements?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const LANG_KEY = 'app-language'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY)
      if (saved === 'en' || saved === 'es') return saved
    } catch {}
    return 'es'
  })

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {}
  }, [lang])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
  }

  const t = (key: TranslationKey, replacements?: Record<string, string>): string => {
    let text: string = translations[lang][key] || translations.es[key] || key
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v)
      })
    }
    return text
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
