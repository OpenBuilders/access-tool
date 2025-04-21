import { ApiService, ApiServiceResponse } from '@services'

import {
  Condition,
  ConditionCategory,
  ConditionCreateArgs,
  ConditionDeleteArgs,
  ConditionFetchArgs,
  ConditionType,
  ConditionUpdateArgs,
  PrefetchedConditionData,
} from './types'

const ConditionTypePath: Record<ConditionType, string> = {
  jetton: 'jettons',
  nft_collection: 'nft-collections',
  whitelist: 'whitelist',
  whitelist_external: 'whitelist-external',
  premium: 'premium',
  toncoin: 'toncoin',
  emoji: 'emoji',
}

// Jettons

export const fetchConditionApi = async (
  args: ConditionFetchArgs
): Promise<ApiServiceResponse<Condition>> => {
  const { type, chatSlug, conditionId } = args
  const path = ConditionTypePath[type]
  const response = await ApiService.get<Condition>({
    endpoint: `/admin/chats/${chatSlug}/rules/${path}/${conditionId}`,
  })

  return response
}

export const createConditionApi = async (
  args: ConditionCreateArgs
): Promise<ApiServiceResponse<Condition>> => {
  const { type, chatSlug, data } = args
  const path = ConditionTypePath[type]
  const response = await ApiService.post<Condition>({
    endpoint: `/admin/chats/${chatSlug}/rules/${path}`,
    data: data,
  })

  return response
}

export const updateConditionApi = async (
  args: ConditionUpdateArgs
): Promise<ApiServiceResponse<Condition>> => {
  const { type, chatSlug, conditionId, data } = args
  const path = ConditionTypePath[type]
  // let formData = {
  //   ...data,
  // }
  // if (data?.type === 'jetton' || data?.type === 'nft_collection') {
  //   formData = {
  //     ...formData,
  //     address: data?.address || data?.blockchainAddress || '',
  //   } as any
  //   delete formData.blockchainAddress
  // }

  const response = await ApiService.put<Condition>({
    endpoint: `/admin/chats/${chatSlug}/rules/${path}/${conditionId}`,
    data,
  })

  return response
}

export const deleteConditionApi = async (
  args: ConditionDeleteArgs
): Promise<ApiServiceResponse<Condition>> => {
  const { type, chatSlug, conditionId } = args
  const path = ConditionTypePath[type]
  const response = await ApiService.delete<Condition>({
    endpoint: `/admin/chats/${chatSlug}/rules/${path}/${conditionId}`,
  })

  return response
}

export const prefetchConditionDataApi = async (
  type: ConditionType,
  address: string
): Promise<ApiServiceResponse<PrefetchedConditionData>> => {
  const path = ConditionTypePath[type]
  const response = await ApiService.get<PrefetchedConditionData>({
    endpoint: `/admin/resources/prefetch/${path}?address=${address}`,
  })

  return response
}

export const fetchConditionCategoriesApi = async (
  type: ConditionType
): Promise<ApiServiceResponse<ConditionCategory[]>> => {
  const path = ConditionTypePath[type]
  const response = await ApiService.get<ConditionCategory[]>({
    endpoint: `/admin/resources/categories/${path}`,
  })

  return response
}
