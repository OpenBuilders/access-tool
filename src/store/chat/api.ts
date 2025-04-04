import { ApiService, ApiServiceResponse } from '@services'

export const fetchChatAPI = async (
  slug: string
): Promise<ApiServiceResponse<any>> => {
  const response = await ApiService.get<any>({
    endpoint: `/admin/chats/${slug}`,
  })

  return response
}
