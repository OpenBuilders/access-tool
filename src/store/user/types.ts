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
  walletAddress: string | null
}

export type Chat = {
  id: number
  username: string | null
  title: string
  description: string
  slug: string
  isForum: boolean
  logoPath: string
  insufficientPrivileges: boolean
}
