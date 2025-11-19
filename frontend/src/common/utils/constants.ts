import { ChatsPopularOrderBy, ConditionType } from '@types'

export const API_VALIDATION_ERROR = 'Fill fields correctly'

export const API_ERRORS = {}

export const TANSTACK_KEYS = {
  AUTH: ['auth'],
  USER: ['user'],
  CHATS_POPULAR: (sortBy: ChatsPopularOrderBy) => ['chats', 'popular', sortBy],
  CHAT: (slug: string) => ['chat', slug],
  CHAT_POLLING: (slug: string) => ['chat', 'polling', slug],
  ADMIN_CHATS: ['admin', 'chats'],
  ADMIN_CHAT: (slug: string) => ['admin', 'chat', slug],
  ADMIN_CHATS_POLLING: ['admin', 'chats', 'polling'],
  ADMIN_CHAT_POLLING: (slug: string) => ['admin', 'chat', 'polling', slug],
  ADMIN_CONDITION: (
    chatSlug: string,
    conditionId: string,
    type: ConditionType
  ) => ['admin', 'condition', chatSlug, conditionId, type],
  ADMIN_CONDITION_STICKERS: ['admin', 'condition', 'stickers'],
  ADMIN_CONDITION_GIFTS: ['admin', 'condition', 'gifts'],
  ADMIN_CONDITION_JETTONS: (address: string) => [
    'admin',
    'condition',
    'jettons',
    address,
  ],
  ADMIN_CONDITION_CATEGORIES: (type: ConditionType) => [
    'admin',
    'condition',
    'toncoins',
    type,
  ],
}

export const TANSTACK_TTL = {
  AUTH: 5 * 60 * 1000, // 5 minute
  USER: 1 * 60 * 1000, // 1 minute
  CHATS_POPULAR: 5 * 60 * 1000, // 5 minute
  ADMIN_CHATS: 5 * 60 * 1000, // 5 minute
  CHAT: 5 * 60 * 1000, // 5 minute
  ADMIN_CONDITION: 2 * 60 * 1000, // 2 minutes
  ADMIN_CONDITION_STICKERS: 2 * 60 * 1000, // 2 minutes
  ADMIN_CONDITION_GIFTS: 2 * 60 * 1000, // 2 minutes
  ADMIN_CONDITION_JETTONS: 2 * 60 * 1000, // 2 minutes
  ADMIN_CONDITION_CATEGORIES: 2 * 60 * 1000, // 2 minutes
}

export const TANSTACK_GC_TIME = 30 * 60 * 1000 // 30 minute
