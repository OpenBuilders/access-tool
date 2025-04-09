export type AuthenticatedUser = {
  access_token: string
  expires_in: number
}

export type User = {
  id: number
  firstName: string
  lastName: string
  username: string
  isPremium: boolean
  languageCode: string
  photoUrl: string | null
  wallets: string[]
}

export type ChatTaskComplete = {
  status: 'string'
  message: 'string'
}

export type WalletData = {
  tonProof: {
    timestamp: number
    domain: {
      lengthBytes: number
      value: string
    }
    signature: string
    payload: string
  }
  walletAddress: string
  publicKey: string
}
