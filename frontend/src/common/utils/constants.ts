import { ChatsPopularSortBy } from '@types'

export const API_VALIDATION_ERROR = 'Fill fields correctly'

export const API_ERRORS = {}

export const TANSTACK_KEYS = {
  CHATS_POPULAR: (sortBy: ChatsPopularSortBy) => ['chats', 'popular', sortBy],
  CHAT: (slug: string) => ['chat', slug],
  ADMIN_CHATS: ['admin', 'chats'],
}

export const TANSTACK_TTL = {
  CHATS_POPULAR: 5 * 60 * 1000, // 5 minute
  ADMIN_CHATS: 5 * 60 * 1000, // 5 minute
  CHAT: 5 * 60 * 1000, // 5 minute
}

export const TANSTACK_GC_TIME = 30 * 60 * 1000 // 30 minute
