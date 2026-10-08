import { createContext, useContext, useReducer, useEffect, useRef, useState, type ReactNode } from 'react'
import type {
  WizardState,
  StorageCapacity,
  ScreenCondition,
  BackCondition,
  FrameCondition,
  FunctionalityIssues,
  OriginalParts,
} from '../types'

// Initial state
const initialState: WizardState = {
  currentStep: 1,
  // Step 1
  model: null,
  storage: null,
  // Step 2 - Physical
  screenCondition: null,
  backCondition: null,
  frameCondition: null,
  hasLiquidDamage: null,
  // Step 3 - Battery & Parts
  batteryHealth: null,
  originalParts: {
    screen: null,
    battery: null,
  },
  hasOriginalBox: null,
  // Step 4 - Functionality
  functionalityIssues: {
    faceId: false,
    camera: false,
    audio: false,
    charging: false,
  },
  // Step 5 - iCloud
  iCloudOff: null,
  // Upgrade
  upgradeModel: null,
  upgradeStorage: null,
  upgradeColor: null,
  upgradePrice: null,
  // Contact (mandatory before result)
  contactName: null,
  contactPhone: null,
}

// Actions
type WizardAction =
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_STORAGE'; payload: StorageCapacity }
  | { type: 'SET_SCREEN_CONDITION'; payload: ScreenCondition }
  | { type: 'SET_BACK_CONDITION'; payload: BackCondition }
  | { type: 'SET_FRAME_CONDITION'; payload: FrameCondition }
  | { type: 'SET_LIQUID_DAMAGE'; payload: boolean }
  | { type: 'SET_BATTERY_HEALTH'; payload: 'good' | 'low' }
  | { type: 'SET_ORIGINAL_PARTS'; payload: Partial<OriginalParts> }
  | { type: 'SET_ORIGINAL_BOX'; payload: boolean }
  | { type: 'SET_FUNCTIONALITY'; payload: Partial<FunctionalityIssues> }
  | { type: 'SET_ICLOUD'; payload: boolean }
  | { type: 'SET_UPGRADE_MODEL'; payload: string }
  | { type: 'SET_UPGRADE_STORAGE'; payload: string }
  | { type: 'SET_UPGRADE_COLOR'; payload: string }
  | { type: 'SET_UPGRADE_PRICE'; payload: number }
  | { type: 'SET_UPGRADE_ALL'; payload: { model: string; storage: string; color: string; price: number } }
  | { type: 'CLEAR_UPGRADE' }
  | { type: 'SET_CONTACT_NAME'; payload: string }
  | { type: 'SET_CONTACT_PHONE'; payload: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'RESET' }

const TOTAL_STEPS = 6

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_MODEL':
      // Reset storage when model changes (different models have different options)
      return { ...state, model: action.payload, storage: null }
    case 'SET_STORAGE':
      return { ...state, storage: action.payload }
    case 'SET_SCREEN_CONDITION':
      return { ...state, screenCondition: action.payload }
    case 'SET_BACK_CONDITION':
      return { ...state, backCondition: action.payload }
    case 'SET_FRAME_CONDITION':
      return { ...state, frameCondition: action.payload }
    case 'SET_LIQUID_DAMAGE':
      return { ...state, hasLiquidDamage: action.payload }
    case 'SET_BATTERY_HEALTH':
      return { ...state, batteryHealth: action.payload }
    case 'SET_ORIGINAL_PARTS':
      return { ...state, originalParts: { ...state.originalParts, ...action.payload } }
    case 'SET_ORIGINAL_BOX':
      return { ...state, hasOriginalBox: action.payload }
    case 'SET_FUNCTIONALITY':
      return { ...state, functionalityIssues: { ...state.functionalityIssues, ...action.payload } }
    case 'SET_ICLOUD':
      return { ...state, iCloudOff: action.payload }
    case 'SET_UPGRADE_MODEL':
      return { ...state, upgradeModel: action.payload, upgradeStorage: null, upgradeColor: null, upgradePrice: null }
    case 'SET_UPGRADE_STORAGE':
      return { ...state, upgradeStorage: action.payload, upgradeColor: null, upgradePrice: null }
    case 'SET_UPGRADE_COLOR':
      return { ...state, upgradeColor: action.payload }
    case 'SET_UPGRADE_PRICE':
      return { ...state, upgradePrice: action.payload }
    case 'SET_UPGRADE_ALL':
      return {
        ...state,
        upgradeModel: action.payload.model,
        upgradeStorage: action.payload.storage,
        upgradeColor: action.payload.color,
        upgradePrice: action.payload.price,
      }
    case 'CLEAR_UPGRADE':
      return { ...state, upgradeModel: null, upgradeStorage: null, upgradeColor: null, upgradePrice: null }
    case 'SET_CONTACT_NAME':
      return { ...state, contactName: action.payload }
    case 'SET_CONTACT_PHONE':
      return { ...state, contactPhone: action.payload }
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS + 1) }
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) }
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

interface WizardContextValue {
  state: WizardState
  setModel: (model: string) => void
  setStorage: (storage: StorageCapacity) => void
  setScreenCondition: (condition: ScreenCondition) => void
  setBackCondition: (condition: BackCondition) => void
  setFrameCondition: (condition: FrameCondition) => void
  setLiquidDamage: (hasDamage: boolean) => void
  setBatteryHealth: (health: 'good' | 'low') => void
  setOriginalParts: (parts: Partial<OriginalParts>) => void
  setOriginalBox: (hasBox: boolean) => void
  setFunctionality: (issues: Partial<FunctionalityIssues>) => void
  setICloud: (isOff: boolean) => void
  setUpgradeModel: (model: string) => void
  setUpgradeStorage: (storage: string) => void
  setUpgradeColor: (color: string) => void
  setUpgradePrice: (price: number) => void
  setUpgradeAll: (upgrade: { model: string; storage: string; color: string; price: number }) => void
  clearUpgrade: () => void
  setContactName: (name: string) => void
  setContactPhone: (phone: string) => void
  canjeMode: boolean
  setCanjeMode: (value: boolean) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  reset: () => void
  isStepComplete: (step: number) => boolean
  totalSteps: number
}

const WizardContext = createContext<WizardContextValue | null>(null)

const STORAGE_KEY = 'wizard-state-v2' // New version key to avoid conflicts

function loadState(): WizardState {
  try {
    // Fresh start when coming from market or external link
    const params = new URLSearchParams(window.location.search)
    if (params.has('new') || params.has('canje')) {
      sessionStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem('in-canje')
      // Limpiar flags de sesión anterior (evita que quede un "volver al original" viejo)
      sessionStorage.removeItem('original-upgrade')
      if (params.has('canje')) {
        sessionStorage.setItem('auto-canje', '1')
        sessionStorage.setItem('in-canje', '1')
      }
      // Clean the URL without reloading
      window.history.replaceState({}, '', window.location.pathname)
      return initialState
    }
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Ensure all new fields exist with defaults
      return {
        ...initialState,
        ...parsed,
        originalParts: { ...initialState.originalParts, ...parsed.originalParts },
        functionalityIssues: { ...initialState.functionalityIssues, ...parsed.functionalityIssues },
      }
    }
  } catch (e) {
    console.error('Error loading wizard state:', e)
  }
  return initialState
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState, loadState)
  const [canjeMode, setCanjeMode] = useState<boolean>(() => sessionStorage.getItem('in-canje') === '1')
  const celebrationRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (canjeMode) sessionStorage.setItem('in-canje', '1')
    else sessionStorage.removeItem('in-canje')
  }, [canjeMode])

  // Preload celebration audio once on mount
  useEffect(() => {
    const audio = new Audio('/celebration.mp3')
    audio.volume = 0.5
    audio.preload = 'auto'
    audio.load()
    celebrationRef.current = audio
    return () => { audio.pause(); audio.currentTime = 0 }
  }, [])

  useEffect(() => {
    try {
      // Excluir info personal del storage (no debe persistirse)
      const { contactName: _n, contactPhone: _p, ...persistable } = state
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
    } catch (e) {
      console.error('Error saving wizard state:', e)
    }
  }, [state])

  const value: WizardContextValue = {
    state,
    setModel: (model) => dispatch({ type: 'SET_MODEL', payload: model }),
    setStorage: (storage) => dispatch({ type: 'SET_STORAGE', payload: storage }),
    setScreenCondition: (condition) => dispatch({ type: 'SET_SCREEN_CONDITION', payload: condition }),
    setBackCondition: (condition) => dispatch({ type: 'SET_BACK_CONDITION', payload: condition }),
    setFrameCondition: (condition) => dispatch({ type: 'SET_FRAME_CONDITION', payload: condition }),
    setLiquidDamage: (hasDamage) => dispatch({ type: 'SET_LIQUID_DAMAGE', payload: hasDamage }),
    setBatteryHealth: (health) => dispatch({ type: 'SET_BATTERY_HEALTH', payload: health }),
    setOriginalParts: (parts) => dispatch({ type: 'SET_ORIGINAL_PARTS', payload: parts }),
    setOriginalBox: (hasBox) => dispatch({ type: 'SET_ORIGINAL_BOX', payload: hasBox }),
    setFunctionality: (issues) => dispatch({ type: 'SET_FUNCTIONALITY', payload: issues }),
    setICloud: (isOff) => dispatch({ type: 'SET_ICLOUD', payload: isOff }),
    setUpgradeModel: (model) => dispatch({ type: 'SET_UPGRADE_MODEL', payload: model }),
    setUpgradeStorage: (storage) => dispatch({ type: 'SET_UPGRADE_STORAGE', payload: storage }),
    setUpgradeColor: (color) => dispatch({ type: 'SET_UPGRADE_COLOR', payload: color }),
    setUpgradePrice: (price) => dispatch({ type: 'SET_UPGRADE_PRICE', payload: price }),
    setUpgradeAll: (upgrade) => dispatch({ type: 'SET_UPGRADE_ALL', payload: upgrade }),
    clearUpgrade: () => dispatch({ type: 'CLEAR_UPGRADE' }),
    setContactName: (name) => dispatch({ type: 'SET_CONTACT_NAME', payload: name }),
    setContactPhone: (phone) => dispatch({ type: 'SET_CONTACT_PHONE', payload: phone }),
    canjeMode,
    setCanjeMode,
    nextStep: () => {
      if (state.currentStep === 6 && celebrationRef.current) {
        celebrationRef.current.currentTime = 0
        celebrationRef.current.play().catch(() => {})
      }
      dispatch({ type: 'NEXT_STEP' })
    },
    prevStep: () => dispatch({ type: 'PREV_STEP' }),
    goToStep: (step) => dispatch({ type: 'GO_TO_STEP', payload: step }),
    reset: () => {
      sessionStorage.removeItem(STORAGE_KEY)
      dispatch({ type: 'RESET' })
    },
    isStepComplete: (step: number) => {
      switch (step) {
        case 1:
          return true // Upgrade is optional, always complete
        case 2:
          return state.model !== null && state.storage !== null
        case 3:
          return (
            state.screenCondition !== null &&
            state.backCondition !== null &&
            state.frameCondition !== null &&
            state.hasLiquidDamage !== null
          )
        case 4:
          return state.batteryHealth !== null && state.hasOriginalBox !== null
        case 5:
          return true // Checkboxes always complete
        default:
          return false
      }
    },
    totalSteps: TOTAL_STEPS,
  }

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
