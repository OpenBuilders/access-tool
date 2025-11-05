export type AdminChat = {
  id: number
  title: string
  description: string | null
  slug: string
  isForum: boolean
  logoPath: string | null
  membersCount: number
  tcv: number
  username: string | null
  isEnabled: boolean
  joinUrl: string
  insufficientPrivileges: boolean
}
