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
  chatSlug: string
) => {
  const needWalletConnection = checkWalletRequirements(rules)
  const emojiCondition = rules?.find((rule) => rule.type === 'emoji')

  if (emojiCondition) {
    const checkEmojiStatusCompleted = LocalStorageService.getItem(
      `emojiStatusCompleted_${chatSlug}_${emojiCondition.id}`
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
  const emojiCondition = rules.find((rule) => rule.type === 'emoji')

  if (emojiCondition) {
    const checkEmojiStatusCompleted = LocalStorageService.getItem(
      `emojiStatusCompleted_${chat.slug}_${emojiCondition.id}`
    )
    if (!checkEmojiStatusCompleted) {
      return false
    }
  }

  return chat.isEligible
}
