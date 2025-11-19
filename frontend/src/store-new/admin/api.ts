import { AdminChat } from '@types'

import { ApiService, ApiServiceResponse } from '@services'

export const fetchAdminChatsAPI = async (): Promise<
  ApiServiceResponse<AdminChat[]>
> => {
  const response = await ApiService.get<AdminChat[]>({
    endpoint: '/admin/chats',
  })

  return response
}
