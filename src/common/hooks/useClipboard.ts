import { useToast } from '@components'

export function useClipboard() {
  const { showToast } = useToast()

  const webApp = window.Telegram.WebApp

  return {
    copy: (text: string, message: string) => {
      webApp.HapticFeedback.notificationOccurred('success')
      navigator.clipboard
        .writeText(text.toString())
        .then(() => {
          showToast({ message, type: 'copy', time: 2000 })
        })
        .catch((err) => {
          showToast({ type: 'error', message: 'Unable to copy' })
        })
    },
  }
}
