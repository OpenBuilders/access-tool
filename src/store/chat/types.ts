export type Chat = {
  chat: ChatInstance
  rules: ChatRule[]
}

export type ChatInstance = {
  description: string | null
  id: number
  insufficientPrivileges: boolean
  isEligible: boolean
  isForum: boolean
  isMember: boolean
  joinUrl: string
  logoPath: string | null
  slug: string
  title: string
  username: string | null
}

export type ChatRuleAttribute = {
  traitType: string
  value: string
}

export type ChatRule = {
  id: number
  category: string
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  isEnabled: boolean
  requiredAttributes: ChatRuleAttribute[]
  promoteUrl: string
}
