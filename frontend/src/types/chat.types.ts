import { Condition, Group } from '@types'

export type ChatInstance = {
  chat: Chat
  groups: Group[]
  rules: Condition[]
  wallet?: string | null
}

export type Chat = {
  description: string | null
  id: number
  insufficientPrivileges: boolean
  isEnabled: boolean
  isForum: boolean
  joinUrl: string
  logoPath: string | null
  membersCount: number
  slug: string
  tcv: number
  title: string
  username: string | null
}

export type ChatPopular = Pick<
  Chat,
  | 'description'
  | 'id'
  | 'isForum'
  | 'logoPath'
  | 'membersCount'
  | 'slug'
  | 'tcv'
  | 'title'
>

export type ChatPopularResponse = {
  totalCount: number
  items: ChatPopular[]
}
