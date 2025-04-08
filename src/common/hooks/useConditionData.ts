import { useToast } from '@components'
import { Jettons, NFT } from '@pages'
import { ROUTES_NAME } from '@routes'
import { useState, useCallback } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import {
  INITIAL_CONDITION_JETTON,
  INITIAL_CONDITION_NFT_COLLECTION,
  useConditionActions,
} from '@store'

import { useAppNavigation } from './useAppNavigation'

export const useConditionData = (isNewCondition?: boolean) => {
  const { appNavigate } = useAppNavigation()
  const { showToast } = useToast()

  const params = useParams<{
    conditionId: string
    chatSlug: string
    conditionType: string
  }>()

  const conditionIdParam = params.conditionId
  const chatSlugParam = params.chatSlug
  const conditionTypeParam = params.conditionType

  const [conditionData, setConditionData] = useState<any>(null)

  const conditionTypeQuery = new URLSearchParams(window.location.search).get(
    'conditionType'
  )

  const {
    fetchConditionJettonAction,
    createConditionJettonAction,
    deleteConditionJettonAction,
    createConditionNFTCollectionAction,
    setInitialConditionAction,
  } = useConditionActions()

  const CONDITIONS = {
    jetton: {
      Component: Jettons,
      create: createConditionJettonAction,
      fetch: fetchConditionJettonAction,
      update: () => {},
      delete: deleteConditionJettonAction,
      initialState: INITIAL_CONDITION_JETTON,
    },
    'nft-collections': {
      Component: NFT,
      create: createConditionNFTCollectionAction,
      fetch: () => {},
      update: () => {},
      delete: () => {},
      initialState: INITIAL_CONDITION_NFT_COLLECTION,
    },
  }
  useEffect(() => {
    if (conditionTypeParam && conditionIdParam && !isNewCondition) {
      const result = CONDITIONS[conditionTypeParam as keyof typeof CONDITIONS]
      if (!result) return
      setConditionData(result)
    }
    if (conditionTypeQuery && isNewCondition) {
      const result = CONDITIONS[conditionTypeQuery as keyof typeof CONDITIONS]
      if (!result) return
      setConditionData(result)
      setInitialConditionAction(result.initialState)
      appNavigate({
        path: ROUTES_NAME.CHAT_NEW_CONDITION,
        params: { chatSlug: chatSlugParam },
        queryParams: { conditionType: conditionTypeQuery },
      })
    }
  }, [
    conditionTypeParam,
    conditionTypeQuery,
    conditionIdParam,
    isNewCondition,
    chatSlugParam,
  ])

  const fetchConditionMethod = useCallback(async () => {
    if (!conditionData) return
    try {
      await conditionData.fetch(chatSlugParam, conditionIdParam)
    } catch (error) {
      console.error(error)
    }
  }, [conditionData, chatSlugParam, conditionIdParam])

  const deleteConditionMethod = useCallback(async () => {
    if (!conditionData) return
    try {
      await conditionData.delete(chatSlugParam, conditionIdParam)
      showToast({
        message: 'Condition removed',
        type: 'success',
      })
      appNavigate({
        path: ROUTES_NAME.CHAT,
        params: {
          chatSlug: chatSlugParam,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }, [conditionData, chatSlugParam, conditionIdParam, showToast, appNavigate])

  const createConditionMethod = useCallback(async () => {
    if (!conditionData) return
    try {
      await conditionData.create(chatSlugParam)
      showToast({
        message: 'Condition created',
        type: 'success',
      })
      appNavigate({
        path: ROUTES_NAME.CHAT,
        params: {
          chatSlug: chatSlugParam,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }, [conditionData, chatSlugParam, showToast, appNavigate])

  const updateConditionMethod = useCallback(async () => {
    if (!conditionData) return
    try {
      await conditionData.update()
    } catch (error) {
      console.error(error)
    }
  }, [conditionData])

  return {
    fetchConditionMethod,
    deleteConditionMethod,
    createConditionMethod,
    updateConditionMethod,
    ConditionComponent: conditionData?.Component,
    initialState: conditionData?.initialState,
  }
}
