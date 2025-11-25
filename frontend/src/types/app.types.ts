export type ChatsActiveTab = 'explore' | 'added'
export type ChatsPopularOrderBy =
  | 'tcv'
  | '-tcv'
  | 'users-count'
  | '-users-count'

export type Option = {
  label: string
  value: string | null
  image?: string
}

export type FileData = {
  url: string
  name: string
  description: string
  users?: number[] | string[]
}
