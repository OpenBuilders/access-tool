import {
  Chat,
  ChatInstance,
  Condition,
  ConditionAPIArgs,
  ConditionType,
} from '@types'

import { ApiService, ApiServiceResponse } from '@services'

import { ConditionTypePath } from './constants'

export const fetchAdminChatsAPI = async (): Promise<
  ApiServiceResponse<Chat[]>
> => {
  const response = await ApiService.get<Chat[]>({
    endpoint: '/admin/chats',
  })

  return response
}

export const fetchAdminChatAPI = async (
  slug: string
): Promise<ApiServiceResponse<ChatInstance>> => {
  const response = await ApiService.get<ChatInstance>({
    endpoint: `/admin/chats/${slug}`,
  })

  return response
}

export const updateAdminChatAPI = async (
  slug: string,
  data: Pick<Chat, 'description'>
): Promise<ApiServiceResponse<Chat>> => {
  const response = await ApiService.put<Chat>({
    endpoint: `/admin/chats/${slug}`,
    data,
  })

  return response
}

export const moveAdminChatConditionAPI = async ({
  ruleId,
  groupId,
  type,
  order,
  chatSlug,
}: {
  ruleId: number
  groupId: number
  type: ConditionType
  order: number
  chatSlug: string
}): Promise<{ status: string; message: string }> => {
  const response = await ApiService.put<{ status: string; message: string }>({
    endpoint: `/admin/chats/${chatSlug}/rules/move`,
    data: {
      ruleId,
      groupId,
      type,
      order,
    },
  })

  return response.data || { status: '', message: '' }
}

export const updateAdminChatVisibilityAPI = async (
  slug: string,
  data: Pick<Chat, 'isEnabled'>
): Promise<ApiServiceResponse<Chat>> => {
  const response = await ApiService.put<Chat>({
    endpoint: `/admin/chats/${slug}/visibility`,
    data,
  })

  return response
}

// Condition

export const fetchAdminConditionAPI = async (
  args: ConditionAPIArgs
): Promise<ApiServiceResponse<Condition>> => {
  const { type, chatSlug, conditionId } = args
  const path = ConditionTypePath[type]
  const response = await ApiService.get<Condition>({
    endpoint: `/admin/chats/${chatSlug}/rules/${path}/${conditionId}`,
  })

  return response
}

export const createAdminConditionAPI = async (
  args: ConditionAPIArgs
): Promise<ApiServiceResponse<Condition>> => {
  const { type, chatSlug, data } = args
  const path = ConditionTypePath[type]
  const response = await ApiService.post<Condition>({
    endpoint: `/admin/chats/${chatSlug}/rules/${path}`,
    data,
  })

  return response
}

export const updateAdminConditionAPI = async (
  args: ConditionAPIArgs
): Promise<ApiServiceResponse<Condition>> => {
  const { type, chatSlug, conditionId, data } = args
  const path = ConditionTypePath[type]

  const response = await ApiService.put<Condition>({
    endpoint: `/admin/chats/${chatSlug}/rules/${path}/${conditionId}`,
    data,
  })

  return response
}

export const deleteAdminConditionAPI = async (
  args: ConditionAPIArgs
): Promise<ApiServiceResponse<Condition>> => {
  const { type, chatSlug, conditionId } = args
  const path = ConditionTypePath[type]
  const response = await ApiService.delete<Condition>({
    endpoint: `/admin/chats/${chatSlug}/rules/${path}/${conditionId}`,
  })

  return response
}

export const fetchAdminConditionAddressAPI = async (
  args: ConditionAPIArgs
): Promise<ApiServiceResponse<any>> => {
  const { type, address } = args
  const path = ConditionTypePath[type]
  const response = await ApiService.get<any>({
    endpoint: `/admin/resources/prefetch/${path}?address=${address}`,
  })

  return response
}

export const fetchAdminConditionCategoriesAPI = async (
  type: ConditionType
): Promise<ApiServiceResponse<any>> => {
  const path = ConditionTypePath[type]
  const response = await ApiService.get<any>({
    endpoint: `/admin/resources/categories/${path}`,
  })

  return response
}

export const fetchAdminConditionsStickersAPI = async (): Promise<
  ApiServiceResponse<any>
> => {
  const response = await ApiService.get<any>({
    endpoint: `/admin/resources/stickers`,
  })

  return response
}

export const fetchAdminConditionGiftsAPI = async (): Promise<
  ApiServiceResponse<any>
> => {
  const response = await ApiService.get<any>({
    endpoint: `/admin/resources/gifts`,
  })

  return response
}
