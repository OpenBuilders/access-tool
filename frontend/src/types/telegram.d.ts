// src/types/telegram.d.ts

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp
    }
  }
}

/**
 * Возможные цветовые схемы
 */
export type TelegramColorScheme = 'light' | 'dark'

/**
 * Статусы инвойса
 */
export type TelegramInvoiceStatus =
  | 'paid'
  | 'cancelled'
  | 'failed'
  | 'pending'
  | (string & {})

/**
 * Хендлеры для инвойсов
 */
export interface TelegramInvoiceHandlers {
  onPaid?: () => void
  onCancelled?: () => void
  onFailed?: () => void
  onPending?: () => void
}

/**
 * Telegram Mini App API
 */
export interface TelegramWebApp {
  version: string
  platform?: string
  colorScheme: TelegramColorScheme
  themeParams: Record<string, string>
  initData: string
  initDataUnsafe: any
  viewportHeight: number
  viewportStableHeight: number
  isFullscreen: boolean

  // UI
  MainButton: TelegramMainButton
  BackButton: TelegramBackButton
  HapticFeedback: TelegramHapticFeedback

  // Навигация
  openTelegramLink: (
    url?: string,
    options?: { force_request?: boolean }
  ) => void
  openInvoice: (
    url?: string,
    callback?: (status: TelegramInvoiceStatus) => void
  ) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openPopup: (
    params: TelegramPopupParams,
    callback?: (id: string) => void
  ) => void
  openAlert: (message: string, callback?: () => void) => void
  openConfirm: (message: string, callback?: (ok: boolean) => void) => void

  // Интерфейс
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  readTextFromClipboard: () => string

  // Экран
  lockOrientation: () => void
  unlockOrientation?: () => void
  disableVerticalSwipes: () => void
  requestFullscreen: () => void

  // События
  onEvent: (event: string, handler?: (...args: any[]) => void) => void
  offEvent: (event: string, handler?: (...args: any[]) => void) => void
  sendData: (data: string) => void

  // Прочее
  ready: () => void
  close: () => void
}

/**
 * MainButton API
 */
export interface TelegramMainButton {
  text: string
  color: string
  textColor: string
  isVisible: boolean
  isActive: boolean
  show: () => void
  hide: () => void
  enable: () => void
  disable: () => void
  setText: (text: string) => void
  onClick: (callback: () => void) => void
  offClick: (callback: () => void) => void
  setParams: (params: {
    text?: string
    color?: string
    text_color?: string
    is_active?: boolean
    is_visible?: boolean
  }) => void
  setTextColor: (color: string) => void
  setColor: (color: string) => void
  hideProgress: () => void
  showProgress: () => void
}

/**
 * BackButton API
 */
export interface TelegramBackButton {
  isVisible: boolean
  show: () => void
  hide: () => void
  onClick: (callback: () => void) => void
  offClick: (callback: () => void) => void
}

/**
 * Haptic feedback API
 */
export interface TelegramHapticFeedback {
  impactOccurred: (
    style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
  ) => void
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void
  selectionChanged: () => void
}

/**
 * Popup API
 */
export interface TelegramPopupParams {
  title?: string
  message: string
  buttons: { id: string; type?: 'default' | 'destructive'; text: string }[]
}
