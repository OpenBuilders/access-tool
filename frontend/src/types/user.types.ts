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
