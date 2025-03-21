import {
  Container,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useParams } from 'react-router-dom'

import { ChannelActions, ChannelConditions, ChannelHeader } from './components'

export const ChannelPage = () => {
  const { channelId } = useParams<{ channelId: string }>()
  const { appNavigate } = useAppNavigation()

  if (!channelId) {
    appNavigate({ path: ROUTES_NAME.MAIN })
    return null
  }

  return (
    <PageLayout>
      <TelegramBackButton
        onClick={() => appNavigate({ path: ROUTES_NAME.MAIN })}
      />
      <TelegramMainButton />
      <ChannelHeader />
      <Container margin="8-0-0">
        <ChannelConditions />
      </Container>
      <Container margin="24-0-0">
        <ChannelActions />
      </Container>
    </PageLayout>
  )
}
