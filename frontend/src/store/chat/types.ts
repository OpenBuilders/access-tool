import { Condition } from '../condition'

export type Chat = {
  chat: ChatInstance
  rules: Condition[]
  wallet?: string
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

export type AdminChat = {
  id: number
  username: string | null
  title: string
  description: string
  slug: string
  isForum: boolean
  logoPath: string
  insufficientPrivileges: boolean
}
