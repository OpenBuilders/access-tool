// src/types/telegram.d.ts
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export type TelegramColorScheme = 'light' | 'dark'

export type TelegramInvoiceStatus =
  | 'paid'
  | 'cancelled'
  | 'failed'
  | 'pending'
  | (string & {})

export interface TelegramInvoiceHandlers {
  onPaid?: () => void
  onCancelled?: () => void
  onFailed?: () => void
  onPending?: () => void
}

export interface TelegramWebApp {
  version: string
  platform: string
  sessionId?: string
  colorScheme: TelegramColorScheme
  themeParams: TelegramThemeParams
  initData: string
  initDataUnsafe: TelegramInitDataUnsafe
  headerColor?: string
  backgroundColor?: string

  isExpanded: boolean
  isFullscreen: boolean
  isActive?: boolean
  viewportHeight: number
  viewportStableHeight: number
  contentSafeAreaInset?: TelegramSafeAreaInset
  safeAreaInset?: TelegramSafeAreaInset

  MainButton: TelegramBottomButton
  BackButton: TelegramBackButton
  BottomButton?: TelegramBottomButton
  SecondaryButton?: TelegramSecondaryButton
  HapticFeedback: TelegramHapticFeedback
  Popup?: TelegramPopupApi

  CloudStorage?: TelegramCloudStorage
  DeviceStorage?: TelegramDeviceStorage
  SecureStorage?: TelegramSecureStorage
  BiometricManager?: TelegramBiometricManager
  LocationManager?: TelegramLocationManager
  Accelerometer?: TelegramSensorController
  Gyroscope?: TelegramSensorController
  DeviceOrientation?: TelegramSensorController

  ready(): void
  expand(): void
  close(): void
  sendData(data: string): void

  openLink(url: string, options?: TelegramOpenLinkOptions): void
  openTelegramLink(url: string): void
  openInvoice(
    url: string,
    onStatusChanged?: (status: TelegramInvoiceStatus) => void
  ): void

  showPopup(params: TelegramPopupParams, callback?: (id: string) => void): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback?: (ok: boolean) => void): void

  enableClosingConfirmation(): void
  disableClosingConfirmation(): void
  enableVerticalSwipes(): void
  disableVerticalSwipes(): void
  lockOrientation(orientation?: TelegramScreenOrientation): Promise<void>
  unlockOrientation(): Promise<void>

  requestFullscreen(): void
  exitFullscreen(): void

  setHeaderColor(colorKey: string): void
  setBackgroundColor(colorKey: string): void
  setBottomBarColor(color: string): void

  requestWriteAccess(): Promise<void>
  requestContact(): Promise<void>
  requestPhone(): Promise<void>
  requestBiometricAuth?(params?: TelegramBiometricAuthParams): Promise<void>

  addToHomeScreen(): Promise<TelegramHomeScreenStatus>
  checkHomeScreenStatus(): Promise<TelegramHomeScreenStatus>

  shareMessage(params: TelegramShareMessageParams): Promise<void>
  shareToStory(params: TelegramShareStoryParams): Promise<void>
  downloadFile(params: TelegramDownloadFileParams): Promise<void>

  setEmojiStatus(params: TelegramEmojiStatusParams): Promise<void>
  requestEmojiStatusAccess(): Promise<TelegramEmojiStatusRequestResult>

  readTextFromClipboard(): Promise<string>

  onEvent<E extends TelegramWebAppEvent>(
    event: E,
    handler: TelegramEventHandler<E>
  ): void
  offEvent<E extends TelegramWebAppEvent>(
    event: E,
    handler?: TelegramEventHandler<E>
  ): void

  // отладка
  switchInlineQuery(query: string, chooseChatTypes?: TelegramChatType[]): void
}

export type TelegramWebAppEvent =
  | 'themeChanged'
  | 'viewportChanged'
  | 'mainButtonClicked'
  | 'backButtonClicked'
  | 'bottomButtonClicked'
  | 'secondaryButtonClicked'
  | 'settingsButtonClicked'
  | 'invoiceClosed'
  | 'popupClosed'
  | 'qrTextReceived'
  | 'clipboardTextReceived'
  | 'writeAccessRequested'
  | 'contactRequested'
  | 'homeScreenAdded'
  | 'homeScreenChecked'
  | 'accelerometerStarted'
  | 'accelerometerStopped'
  | 'accelerometerChanged'
  | 'accelerometerFailed'
  | 'deviceOrientationStarted'
  | 'deviceOrientationStopped'
  | 'deviceOrientationChanged'
  | 'deviceOrientationFailed'
  | 'gyroscopeStarted'
  | 'gyroscopeStopped'
  | 'gyroscopeChanged'
  | 'gyroscopeFailed'
  | 'locationRequested'
  | 'locationManagerUpdated'
  | 'shareMessageSent'
  | 'shareMessageFailed'
  | 'fileDownloadRequested'
  | 'fullscreenChanged'
  | 'fullscreenFailed'
  | 'activated'
  | 'deactivated'
  | 'safeAreaChanged'
  | 'contentSafeAreaChanged'
  | 'emojiStatusSet'
  | 'emojiStatusFailed'
  | 'emojiStatusAccessRequested'

export type TelegramEventHandler<E extends TelegramWebAppEvent> = (
  payload?: any
) => void

export interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  accent_text_color?: string
  section_bg_color?: string
  section_header_text_color?: string
  subtitle_text_color?: string
  destructive_text_color?: string
  bottom_bar_bg_color?: string
}

export interface TelegramInitDataUnsafe {
  query_id?: string
  user?: TelegramWebAppUser
  receiver?: TelegramWebAppUser
  chat?: TelegramWebAppChat
  chat_type?: TelegramChatType
  start_param?: string
  auth_date?: number
  can_send_after?: number
  hash?: string
}

export interface TelegramWebAppUser {
  id: number
  is_bot?: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  added_to_attachment_menu?: boolean
  allows_write_to_pm?: boolean
  photo_url?: string
}

export interface TelegramWebAppChat {
  id: number
  type: TelegramChatType
  title: string
  username?: string
  photo_url?: string
}

export type TelegramChatType = 'users' | 'bots' | 'groups' | 'channels'

export interface TelegramSafeAreaInset {
  top: number
  bottom: number
  left: number
  right: number
}

export interface TelegramBottomButton {
  text: string
  color?: string
  textColor?: string
  isVisible: boolean
  isActive: boolean
  show(): void
  hide(): void
  enable(): void
  disable(): void
  setText(text: string): void
  setTextColor(color: string): void
  setColor(color: string): void
  showProgress(leaveActive?: boolean): void
  hideProgress(): void
  onClick(callback: () => void): void
  offClick(callback: () => void): void
  setParams(params: TelegramButtonParams): void
}

export interface TelegramSecondaryButton extends TelegramBottomButton {
  show(): void
  hide(): void
}

export interface TelegramButtonParams {
  text?: string
  color?: string
  text_color?: string
  is_active?: boolean
  is_visible?: boolean
}

export interface TelegramBackButton {
  isVisible: boolean
  show(): void
  hide(): void
  onClick(callback: () => void): void
  offClick(callback: () => void): void
}

export interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
  notificationOccurred(type: 'error' | 'success' | 'warning'): void
  selectionChanged(): void
}

export interface TelegramPopupApi {
  show(params: TelegramPopupParams, callback?: (id: string) => void): void
  close(): void
}

export interface TelegramPopupParams {
  title?: string
  message: string
  buttons: TelegramPopupButton[]
}

export interface TelegramPopupButton {
  id: string
  text: string
  type?: 'default' | 'destructive' | 'cancel'
}

export interface TelegramOpenLinkOptions {
  try_instant_view?: boolean
  open_internally?: boolean
}

export interface TelegramCloudStorage {
  setItem(key: string, value: string): Promise<void>
  getItem(key: string): Promise<string | null>
  getItems(keys: string[]): Promise<Record<string, string>>
  removeItem(key: string): Promise<void>
  removeItems(keys: string[]): Promise<void>
  getKeys(): Promise<string[]>
}

export interface TelegramDeviceStorage {
  setItem(key: string, value: string): Promise<void>
  getItem(key: string): Promise<string | null>
  removeItem(key: string): Promise<void>
  getKeys(): Promise<string[]>
  clear(): Promise<void>
}

export interface TelegramBiometricManager {
  isBiometricAvailable(): Promise<boolean>
  authenticate(params?: TelegramBiometricAuthParams): Promise<void>
}

export interface TelegramBiometricAuthParams {
  reason?: string
  title?: string
  fallbackButtonTitle?: string
}

export interface TelegramLocationManager {
  getLocation(params?: TelegramLocationParams): Promise<TelegramLocation>
  watchLocation(
    params: TelegramLocationParams,
    callback: (location: TelegramLocation) => void
  ): number
  clearWatch(watchId: number): void
}

export interface TelegramLocationParams {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export interface TelegramLocation {
  latitude: number
  longitude: number
  altitude?: number | null
  accuracy?: number
  heading?: number | null
  speed?: number | null
  timestamp: number
}

export interface TelegramSensorController {
  start(): Promise<void>
  stop(): Promise<void>
  isEnabled?: boolean
}

export type TelegramScreenOrientation =
  | 'auto'
  | 'landscape'
  | 'portrait'
  | 'portrait-primary'
  | 'portrait-secondary'
  | 'landscape-primary'
  | 'landscape-secondary'

export interface TelegramHomeScreenStatus {
  added: boolean
  allowShortcut?: boolean
  platform?: 'ios' | 'android' | 'desktop'
}

export interface TelegramShareMessageParams {
  message: string
  chatTypes?: TelegramChatType[]
  withMyScore?: boolean
  photoUrl?: string
  url?: string
  buttonText?: string
  buttonUrl?: string
}

export interface TelegramShareStoryParams {
  media: TelegramStoryMedia
  caption?: string
}

export type TelegramStoryMedia =
  | { type: 'photo'; mediaUrl: string }
  | { type: 'video'; mediaUrl: string; duration?: number }
  | { type: 'gif'; mediaUrl: string }

export interface TelegramDownloadFileParams {
  url: string
  fileName?: string
  mimeType?: string
}

export interface TelegramEmojiStatusParams {
  customEmojiId: string
  expirationDate?: number
  disableExpiration?: boolean
}

export type TelegramEmojiStatusRequestResult =
  | { status: 'allowed' }
  | { status: 'cancelled' }

export {}
