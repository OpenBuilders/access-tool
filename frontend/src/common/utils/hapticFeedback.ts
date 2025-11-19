type HapticNotificationType = 'success' | 'warning' | 'error'
type HapticImpactType = 'soft' | 'medium' | 'heavy' | 'light'

type HapticFeedbackType = HapticImpactType | HapticNotificationType

export const hapticFeedback = (type: HapticFeedbackType) => {
  const webApp = window?.Telegram?.WebApp
  try {
    if (['success', 'warning', 'error'].includes(type)) {
      webApp?.HapticFeedback?.notificationOccurred(
        type as HapticNotificationType
      )
    } else {
      webApp?.HapticFeedback?.impactOccurred(type as HapticImpactType)
    }
  } catch (error) {
    console.error(error)
  }
}
