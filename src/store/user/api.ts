import { ApiService, ApiServiceResponse } from '@services'

export const fetchUserAPI = async (): Promise<ApiServiceResponse<any>> => {
  const response = await ApiService.get({
    endpoint: '/users/me',
  })

  return response
}
