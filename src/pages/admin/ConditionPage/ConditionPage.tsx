import {
  AppSelect,
  Container,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import commonStyles from '@styles/common.module.scss'
import {
  Cell,
  Section,
  SegmentedControl,
  Select,
  Title,
} from '@telegram-apps/telegram-ui'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import {
  ConditionType,
  INITIAL_CONDITION_JETTON,
  INITIAL_CONDITION_NFT_COLLECTION,
  useCondition,
  useConditionActions,
} from '@store'

import styles from './ConditionPage.module.scss'
import { Jettons, NFT } from './components'
import { CONDITION_TYPES } from './constants'
import { ConditionModule, NewConditionModule } from './modules'

export const ConditionPage = () => {
  const { pathname } = useLocation()
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
