export type Chat = {
  id: number
  title: string
  description: string
  slug: string
  isForum: boolean
  logoPath: string
  membersCount: number
  tcv: number
}

export type AdminChat = Chat & {}

// Response type
export type ChatPopularResponse = {
  totalCount: number
  items: Chat[]
}

//
