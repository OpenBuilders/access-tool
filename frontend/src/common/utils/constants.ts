import { ChatsPopularOrderBy } from '@types'

export const API_VALIDATION_ERROR = 'Fill fields correctly'

export const API_ERRORS = {}

export const TANSTACK_KEYS = {
  AUTH: ['auth'],
  USER: ['user'],
  CHATS_POPULAR: (sortBy: ChatsPopularOrderBy) => ['chats', 'popular', sortBy],
  CHAT: (slug: string) => ['chat', slug],
  ADMIN_CHATS: ['admin', 'chats'],
}

export const TANSTACK_TTL = {
  AUTH: 5 * 60 * 1000, // 5 minute
  USER: 1 * 60 * 1000, // 1 minute
  CHATS_POPULAR: 5 * 60 * 1000, // 5 minute
  ADMIN_CHATS: 5 * 60 * 1000, // 5 minute
  CHAT: 5 * 60 * 1000, // 5 minute
}

export const TANSTACK_GC_TIME = 30 * 60 * 1000 // 30 minute
