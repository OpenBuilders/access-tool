import { Condition } from '@store'

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
  isLoading: boolean
) => {
  const needWalletConnection = checkWalletRequirements(rules)
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
