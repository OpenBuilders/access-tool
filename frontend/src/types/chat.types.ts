export type ChatPopular = {
  id: number
  title: string
  description: string
  slug: string
  isForum: boolean
  logoPath: string
  membersCount: number
  tcv: number
}

// Response type
export type ChatPopularResponse = {
  totalCount: number
  items: ChatPopular[]
}

//
