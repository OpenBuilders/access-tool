import { ChatPopularResponse, ChatsPopularOrderBy } from '@types'

import { ApiService, ApiServiceResponse } from '@services'

export const fetchChatsPopularAPI = async (
  orderBy: ChatsPopularOrderBy
): Promise<ApiServiceResponse<ChatPopularResponse>> => {
  const response = await ApiService.get<ChatPopularResponse>({
    endpoint: `/chats/?orderBy=${orderBy}`,
  })

  return response
}

export const fetchChatAPI = async (
  slug: string
): Promise<ApiServiceResponse<any>> => {
  const response = await ApiService.get<any>({
    endpoint: `/chats/${slug}`,
  })

  return response
}
