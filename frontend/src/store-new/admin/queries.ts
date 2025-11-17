import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Chat, ChatInstance, ConditionType } from '@types'
import {
  findNewChat,
  TANSTACK_GC_TIME,
  TANSTACK_KEYS,
  TANSTACK_TTL,
} from '@utils'
import { useNavigate } from 'react-router-dom'

import {
  fetchAdminChatAPI,
  fetchAdminChatsAPI,
  moveAdminChatConditionAPI,
  updateAdminChatAPI,
} from './api'

export const useAdminChatsQuery = () => {
  return useQuery<Chat[]>({
    queryKey: TANSTACK_KEYS.ADMIN_CHATS,
    queryFn: async () => {
      const { data, ok, error } = await fetchAdminChatsAPI()

      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    gcTime: TANSTACK_GC_TIME,
    staleTime: TANSTACK_TTL.ADMIN_CHATS,
    meta: { persist: true },
  })
}

export const useAdminChatsPollingQuery = (enabled: boolean) => {
  const navigate = useNavigate()

  return useQuery<Chat[]>({
    queryKey: TANSTACK_KEYS.ADMIN_CHATS_POLLING,
    queryFn: async () => {
      const { data, ok, error } = await fetchAdminChatsAPI()

      if (!ok || !data) {
        throw new Error(error)
      }

      console.log('data', data.length)

      return data
    },
    enabled,
    refetchInterval: (query) => {
      const currentData = query.state.data
      // const initialData = queryClient.getQueryData<AdminChat[]>(
      //   TANSTACK_KEYS.ADMIN_CHATS
      // )
      const initialData = [
        {
          id: -1002695830207,
          title: '[draft] Automatization test',
          description: null,
          slug: 'draft-automatization-test',
          isForum: false,
          logoPath: null,
          membersCount: 2,
          tcv: 0,
          username: null,
          isEnabled: true,
          joinUrl: 'https://t.me/+PtVLNs82DQwwZDNi',
          insufficientPrivileges: false,
        },
        {
          id: -1002659072903,
          title: 'Тест чата',
          description: 'fdsfdsfjfjdjdjf',
          slug: 'test-chata',
          isForum: false,
          logoPath:
            'https://pub-afc0b291195b4529b0de88319506f30b.r2.dev/5321025092160975477.png',
          membersCount: 2,
          tcv: 0,
          username: null,
          isEnabled: true,
          joinUrl: 'https://t.me/+RZq9kmi5VoI5ZmUy',
          insufficientPrivileges: false,
        },
        {
          id: -1002547149665,
          title: 'Тестовый канал',
          description: null,
          slug: 'testovyi-kanal',
          isForum: false,
          logoPath: null,
          membersCount: 1,
          tcv: 0,
          username: null,
          isEnabled: true,
          joinUrl: 'https://t.me/+gS8r35jj25BhNjcy',
          insufficientPrivileges: false,
        },
        {
          id: -1002197377487,
          title: '[draft] TelegramTestChat',
          description: null,
          slug: 'draft-telegramtestchat',
          isForum: false,
          logoPath: null,
          membersCount: 1,
          tcv: 0,
          username: null,
          isEnabled: true,
          joinUrl: 'https://t.me/+77Hi8abSl8MwMTBi',
          insufficientPrivileges: false,
        },
        {
          id: -1002156352148,
          title: '[draft] Test subscribtions 2',
          description: null,
          slug: 'draft-test-subscribtions-2',
          isForum: false,
          logoPath: null,
          membersCount: 6,
          tcv: 0,
          username: null,
          isEnabled: true,
          joinUrl: 'https://t.me/+cjDwuYhmtgthOTk6',
          insufficientPrivileges: false,
        },
        {
          id: -10021563521238,
          title: '[draft] Test subscribtions 3',
          description: null,
          slug: 'draft-test-subscribtions-3',
          isForum: false,
          logoPath: null,
          membersCount: 7,
          tcv: 0,
          username: null,
          isEnabled: true,
          joinUrl: 'https://t.me/+cjDwuYhmtgthOTk6',
          insufficientPrivileges: false,
        },
      ] as Chat[]

      if (currentData?.length !== initialData?.length) {
        if (initialData && currentData?.length) {
          const newChat = findNewChat(initialData, currentData, 'slug')
          if (newChat.length) {
            const [chat] = newChat

            if (!chat.insufficientPrivileges) {
              navigate(`/grant-permissions/${chat.slug}`)
              return false
            }

            navigate(`/bot-added-success/${chat.slug}`)
            return false
          }
        }
      }
      return 1500
    },
    gcTime: 0,
    staleTime: 0,
  })
}

export const useAdminChatQuery = (slug: string) => {
  return useQuery<ChatInstance>({
    queryKey: TANSTACK_KEYS.ADMIN_CHAT(slug),
    queryFn: async () => {
      const { data, ok, error } = await fetchAdminChatAPI(slug)

      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    gcTime: TANSTACK_GC_TIME,
    staleTime: TANSTACK_TTL.ADMIN_CHATS,
    enabled: !!slug,
    meta: { persist: true },
  })
}

export const useAdminChatPollingQuery = (slug?: string, enabled?: boolean) => {
  const navigate = useNavigate()

  return useQuery<ChatInstance>({
    queryKey: TANSTACK_KEYS.ADMIN_CHAT_POLLING(slug ?? ''),
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required')

      const { data, ok, error } = await fetchAdminChatAPI(slug)

      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    refetchInterval: (query) => {
      const currentChat = query.state.data

      if (currentChat?.chat.insufficientPrivileges) {
        navigate(`/bot-added-success/${slug}`)
        return false
      }

      return 1500
    },
    enabled: !!slug && !!enabled,
    gcTime: 0,
    staleTime: 0,
  })
}

export const useAdminChatUpdateMutation = (slug: string) => {
  const queryClient = useQueryClient()
  return useMutation<Chat, Error, Pick<Chat, 'description'>>({
    mutationFn: async (newData) => {
      const { data, ok, error } = await updateAdminChatAPI(slug, newData)
      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.ADMIN_CHAT(slug),
      })
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.CHAT(slug),
      })
    },
  })
}

export const useMoveChatConditionMutation = (slug: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      ruleId,
      groupId,
      type,
      order,
    }: {
      ruleId: number
      groupId: number
      type: ConditionType
      order: number
    }) => {
      return await moveAdminChatConditionAPI({
        ruleId,
        groupId,
        type,
        order,
        chatSlug: slug,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.ADMIN_CHAT(slug),
      })
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.CHAT(slug),
      })
    },
  })
}
