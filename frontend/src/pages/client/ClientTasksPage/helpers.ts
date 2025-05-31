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
  isChecking: boolean
  chat: ChatInstance
}

export const createButtonText = ({
  chatWallet,
  rules,
  isChecking,
  chat,
}: CreateButtonTextProps) => {
  const needWalletConnection = checkWalletRequirements(rules)
  const emojiCondition = rules?.find((rule) => rule.type === 'emoji')
  const whitelistCondition = rules?.find((rule) => rule.type === 'whitelist')

  if (emojiCondition && !whitelistCondition) {
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

  if (chatWallet || !needWalletConnection) {
    return 'Check'
  }

  if (isChecking) {
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
    externalSource: [],
    orRequired: [],
    available: [],
    notNeeded: [],
  }

  if (!conditions) {
    return result
  }

  const whitelistCondition = conditions.find(
    (condition) => condition.type === 'whitelist'
  )

  const externalSourceCondition = conditions.find(
    (condition) => condition.type === 'external_source'
  )

  if (whitelistCondition || externalSourceCondition) {
    const formattedConditions = conditions
      .filter(
        (condition) =>
          condition.id !== whitelistCondition?.id &&
          condition.type !== 'whitelist'
      )
      .filter(
        (condition) =>
          condition.id !== externalSourceCondition?.id &&
          condition.type !== 'external_source'
      )

    if (whitelistCondition) {
      result.whitelist.push(whitelistCondition)
    }

    if (externalSourceCondition) {
      result.externalSource.push(externalSourceCondition)
    }

    if (whitelistCondition?.isEligible || externalSourceCondition?.isEligible) {
      result.notNeeded.push(...formattedConditions)
    } else {
      result.orRequired.push(...formattedConditions)
    }

    return result
  }

  result.available = conditions
  return result
}
