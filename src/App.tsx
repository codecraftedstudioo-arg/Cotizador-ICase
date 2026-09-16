import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from '@/lib/i18n'
import { WizardProvider } from '@/features/wizard/hooks/use-wizard'
import { WizardPage } from '@/features/wizard/wizard'
import { fetchExchangeRate } from '@/lib/exchange-rate'
import { fetchMarketPrices } from '@/lib/market-api'
import { initPricingConfig } from '@/lib/pricing-source'

// Prefetch data as soon as the app boots
fetchExchangeRate()
fetchMarketPrices().catch(() => { /* hook se encarga de reintentar */ })
// Precios/penalizaciones del panel (o fallback estático). Arranca temprano
// para estar listo cuando el usuario llegue al wizard.
initPricingConfig()

function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <WizardProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/cotizar" replace />} />
            <Route path="/cotizar" element={<WizardPage />} />
          </Routes>
        </WizardProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}

export default App
