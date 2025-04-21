import { LocalStorageService } from '@services'
import { ChatInstance, Condition } from '@store'

import { FormattedConditions } from './types'

export const checkWalletRequirements = (rules: Condition[] | null) => {
  if (!rules) return false
  return rules.some(
    (rule) =>
      rule.type === 'toncoin' ||
      rule.type === 'nft_collection' ||
      rule.type === 'jetton'
  )
}

interface CreateButtonTextProps {
  chatWallet: string | null
  rules: Condition[]
  isLoading: boolean
  chat: ChatInstance
}

export const createButtonText = ({
  chatWallet,
  rules,
  isLoading,
  chat,
}: CreateButtonTextProps) => {
  const needWalletConnection = checkWalletRequirements(rules)
  const emojiCondition = rules?.find((rule) => rule.type === 'emoji')

  if (emojiCondition) {
    const checkEmojiStatusCompleted = LocalStorageService.getItem(
      `emojiStatusCompleted_${chat.slug}_${emojiCondition.id}`
    )
    if (!checkEmojiStatusCompleted) {
      return 'Check'
    }
  }

  if (chat.isEligible) {
    return 'Join Group'
  }

  if (chatWallet) {
    return 'Check'
  }

  if (isLoading) {
    return 'Checking...'
  }

  if (needWalletConnection && !chatWallet) {
    return 'Connect Wallet'
  }

  return ''
}

export const formatConditions = (conditions: Condition[] | null) => {
  const result: FormattedConditions = {
    whitelist: [],
    notAvailable: [],
    available: [],
    notNeeded: [],
  }

  if (!conditions) {
    return result
  }

  const whitelistCondition = conditions.find(
    (condition) => condition.type === 'whitelist'
  )

  if (whitelistCondition) {
    result.whitelist.push(whitelistCondition)
    const conditionsWithoutWhitelist = conditions.filter(
      (condition) => condition.id !== whitelistCondition.id
    )
    if (whitelistCondition.isEligible) {
      result.notNeeded.push(...conditionsWithoutWhitelist)
    } else {
      result.notAvailable.push(...conditionsWithoutWhitelist)
    }

    return result
  }

  result.available = conditions
  return result
}
