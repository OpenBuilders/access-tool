import { PageLayout } from '@components'
import { TelegramBackButton } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useParams } from 'react-router-dom'

import { ConditionModule, NewConditionModule } from './modules'

export const ConditionPage = () => {
  const params = useParams<{
    conditionId: string
    chatSlug: string
  }>()

  const { appNavigate } = useAppNavigation()

  const chatSlugParam = params.chatSlug || ''
  const conditionIdParam = params.conditionId || ''

  const navigateToChatPage = () => {
    appNavigate({
      path: ROUTES_NAME.CHAT,
      params: { chatSlug: chatSlugParam },
    })
  }

  if (!conditionIdParam)
    return (
      <PageLayout>
        <TelegramBackButton onClick={navigateToChatPage} />
        <NewConditionModule />
      </PageLayout>
    )

  return (
    <PageLayout>
      <TelegramBackButton onClick={navigateToChatPage} />
      <ConditionModule />
    </PageLayout>
  )
}
