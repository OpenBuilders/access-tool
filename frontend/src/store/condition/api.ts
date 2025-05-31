import { ApiService, ApiServiceResponse } from '@services'

import {
  Condition,
  ConditionCategory,
  ConditionCreateArgs,
  ConditionDeleteArgs,
  ConditionFetchArgs,
  ConditionType,
  ConditionUpdateArgs,
  GiftsCollection,
  PrefetchedConditionData,
  StickersCollection,
} from './types'

const ConditionTypePath: Record<ConditionType, string> = {
  jetton: 'jettons',
  nft_collection: 'nft-collections',
  whitelist: 'whitelist',
  external_source: 'external-source',
  premium: 'premium',
  toncoin: 'toncoin',
  emoji: 'emoji',
  sticker_collection: 'stickers',
  gift_collection: 'gifts',
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

export const fetchStickersApi = async (): Promise<
  ApiServiceResponse<StickersCollection[]>
> => {
  const response = await ApiService.get<StickersCollection[]>({
    endpoint: `/admin/resources/stickers`,
  })

  return response
}

export const fetchGiftsApi = async (): Promise<
  ApiServiceResponse<{ collections: GiftsCollection[] }>
> => {
  const response = await ApiService.get<{ collections: GiftsCollection[] }>({
    endpoint: `/admin/resources/gifts`,
  })

  return response
}
