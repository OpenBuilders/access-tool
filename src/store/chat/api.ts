import { ApiService, ApiServiceResponse } from '@services'

import { Chat, ChatInstance } from './types'

export const fetchChatAPI = async (
  slug: string
): Promise<ApiServiceResponse<Chat>> => {
  const response = await ApiService.get<Chat>({
    endpoint: `/admin/chats/${slug}`,
  })

  return response
}

export const updateChatAPI = async (
  slug: string,
  data: Partial<ChatInstance>
): Promise<ApiServiceResponse<Chat>> => {
  const response = await ApiService.put<Chat>({
    endpoint: `/admin/chats/${slug}`,
    data,
  })

  return response
}
