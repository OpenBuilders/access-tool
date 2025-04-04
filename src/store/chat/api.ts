import { ApiService, ApiServiceResponse } from '@services'

import { Chat } from './types'

export const fetchChatAPI = async (
  slug: string
): Promise<ApiServiceResponse<Chat>> => {
  const response = await ApiService.get<Chat>({
    endpoint: `/admin/chats/${slug}`,
  })

  return response
}
