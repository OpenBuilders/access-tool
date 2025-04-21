import { LocalStorageService } from '@services'
import { ChatInstance, Condition } from '@store'

export const checkWalletRequirements = (rules: Condition[] | null) => {
  if (!rules) return false
  return rules?.some(
    (rule) =>
      rule.type === 'toncoin' ||
      rule.type === 'nft_collection' ||
      rule.type === 'jetton'
  )
}

export const createButtonText = (
  chatWallet: string | null,
  rules: Condition[],
  isLoading: boolean,
  chatId: number
) => {
  const needWalletConnection = checkWalletRequirements(rules)
  const hasEmojiCondition = rules?.some((rule) => rule.type === 'emoji')

  if (hasEmojiCondition) {
    const checkEmojiStatusCompleted = LocalStorageService.getItem(
      `emojiStatusCompleted-${chatId}`
    )
    if (!checkEmojiStatusCompleted) {
      return 'Check'
    }
  }

  if (isLoading) {
    return 'Checking...'
  }

  if (chatWallet) {
    return 'Check'
  }

  if (needWalletConnection && !chatWallet) {
    return 'Connect Wallet'
  }

  if (!chatWallet && !needWalletConnection) {
    return 'Check'
  }

  return ''
}

export const checkCanJoinChat = (
  rules: Condition[] | null,
  chat: ChatInstance | null
) => {
  if (!rules || !chat) return false
  const hasEmojiCondition = rules.some((rule) => rule.type === 'emoji')

  if (hasEmojiCondition) {
    const checkEmojiStatusCompleted = LocalStorageService.getItem(
      `emojiStatusCompleted-${chat.id}`
    )
    if (!checkEmojiStatusCompleted) {
      return false
    }
  }

  return chat.isEligible
}
