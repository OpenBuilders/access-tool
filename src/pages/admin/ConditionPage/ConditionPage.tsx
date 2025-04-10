import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { ConditionType, useCondition, useConditionActions } from '@store'

import { ConditionModule, NewConditionModule } from './modules'

export const ConditionPage = () => {
  const params = useParams<{
    conditionId: string
    chatSlug: string
    conditionType: string
  }>()

  const chatSlugParam = params.chatSlug || ''
  const conditionTypeParam = params.conditionType || ''
  const conditionIdParam = params.conditionId || ''

  const { fetchConditionAction } = useConditionActions()
  const { condition } = useCondition()

  const fetchCondition = async () => {
    try {
      await fetchConditionAction({
        type: conditionTypeParam as ConditionType,
        chatSlug: chatSlugParam,
        conditionId: conditionIdParam,
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchCondition()
  }, [conditionIdParam, conditionTypeParam])

  if (!condition) return null

  if (!conditionIdParam) return <NewConditionModule />

  return <ConditionModule />
}
