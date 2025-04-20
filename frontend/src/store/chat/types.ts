import { Condition } from '../condition'

export interface Chat {
  chat: ChatInstance
  rules: Condition[]
  wallet?: string
}

export interface ChatInstance {
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
  membersCount: number
  isEnabled: boolean
}

export interface ChatRuleAttribute {
  traitType: string
  value: string
}

export interface AdminChat {
  id: number
  username: string | null
  title: string
  description: string
  slug: string
  isForum: boolean
  logoPath: string
  insufficientPrivileges: boolean
  membersCount: number
}
