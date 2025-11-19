import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Chat,
  ChatInstance,
  Condition,
  ConditionAPIArgs,
  ConditionCategory,
  ConditionStickersCollection,
  ConditionType,
} from '@types'
import {
  findNewChat,
  TANSTACK_GC_TIME,
  TANSTACK_KEYS,
  TANSTACK_TTL,
} from '@utils'
import { useNavigate } from 'react-router-dom'

import { useConditionActions } from '../condition'
import {
  createAdminConditionAPI,
  deleteAdminConditionAPI,
  fetchAdminChatAPI,
  fetchAdminChatsAPI,
  fetchAdminConditionAPI,
  fetchAdminConditionCategoriesAPI,
  fetchAdminConditionsStickersAPI,
  moveAdminChatConditionAPI,
  updateAdminChatAPI,
  updateAdminChatVisibilityAPI,
  updateAdminConditionAPI,
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
  const queryClient = useQueryClient()

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
      const initialData = queryClient.getQueryData<Chat[]>(
        TANSTACK_KEYS.ADMIN_CHATS
      )

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

export const useAdminChatVisibilityMutation = (slug: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newData: Pick<Chat, 'isEnabled'>) => {
      return await updateAdminChatVisibilityAPI(slug, newData)
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

export const useAdminConditionQuery = (args: ConditionAPIArgs) => {
  return useQuery<Condition>({
    queryKey: TANSTACK_KEYS.ADMIN_CONDITION(
      args.chatSlug ?? '',
      args.conditionId,
      args.type
    ),
    queryFn: async () => {
      const { data, ok, error } = await fetchAdminConditionAPI(args)
      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },

    enabled: !!args.chatSlug && !!args.conditionId && !!args.type,
    gcTime: TANSTACK_GC_TIME,
    staleTime: TANSTACK_TTL.ADMIN_CONDITION,
    meta: { persist: true },
  })
}

export const useAdminCreateConditionMutation = (chatSlug: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newData: ConditionAPIArgs) => {
      const { data, ok, error } = await createAdminConditionAPI(newData)
      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.ADMIN_CHAT(chatSlug),
      })
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.CHAT(chatSlug),
      })
    },
  })
}

export const useAdminUpdateConditionMutation = (chatSlug: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newData: ConditionAPIArgs) => {
      const { data, ok, error } = await updateAdminConditionAPI(newData)
      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    onSuccess: (_, variables) => {
      const { conditionId, type } = variables
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.ADMIN_CONDITION(chatSlug, conditionId, type),
      })
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.ADMIN_CHAT(chatSlug),
      })
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.CHAT(chatSlug),
      })
    },
  })
}

export const useAdminDeleteConditionMutation = (chatSlug: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newData: ConditionAPIArgs) => {
      const { data, ok, error } = await deleteAdminConditionAPI(newData)
      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    onSuccess: (_, variables) => {
      const { conditionId, type } = variables
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.ADMIN_CONDITION(chatSlug, conditionId, type),
      })
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.ADMIN_CHAT(chatSlug),
      })
      queryClient.invalidateQueries({
        queryKey: TANSTACK_KEYS.CHAT(chatSlug),
      })
    },
  })
}

export const useAdminConditionStickersQuery = () => {
  return useQuery<ConditionStickersCollection[]>({
    queryKey: TANSTACK_KEYS.ADMIN_CONDITION_STICKERS,
    queryFn: async () => {
      const { data, ok, error } = await fetchAdminConditionsStickersAPI()
      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    gcTime: TANSTACK_GC_TIME,
    staleTime: TANSTACK_TTL.ADMIN_CONDITION_STICKERS,
    meta: { persist: true },
  })
}

export const useAdminConditionCategoriesQuery = (type: ConditionType) => {
  return useQuery<ConditionCategory[]>({
    queryKey: TANSTACK_KEYS.ADMIN_CONDITION_CATEGORIES(type),
    queryFn: async () => {
      const { data, ok, error } = await fetchAdminConditionCategoriesAPI(type)
      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    enabled: !!type,
    gcTime: TANSTACK_GC_TIME,
    staleTime: TANSTACK_TTL.ADMIN_CONDITION_CATEGORIES,
    meta: { persist: true },
  })
}
