import {
  Block,
  Icon,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useParams } from 'react-router-dom'

import config from '@config'

const webApp = window.Telegram.WebApp

export const AddBotToChatPage = () => {
  const { appNavigate } = useAppNavigation()
  const { chatSlug } = useParams<{ chatSlug: string }>()
  const chatSlugParam = chatSlug || ''
  const navigateToMainPage = () => {
    appNavigate({ path: ROUTES_NAME.MAIN })
  }

  const addGatewayBot = () => {
    webApp.openTelegramLink(
      `${config.botLink}?startgroup=&admin=restrict_members+invite_users`
    )
    appNavigate({
      path: ROUTES_NAME.CHECKING_BOT_ADDED,
      params: { chatSlug: chatSlugParam },
    })
  }

  return (
    <PageLayout center>
      <TelegramBackButton onClick={navigateToMainPage} />
      <TelegramMainButton text="Add Group or Channel" onClick={addGatewayBot} />
      <Icon name="gatewayBot" size={112} />
      <Block margin="top" marginValue={16}>
        <Text type="title" align="center" weight="bold">
          Add Gateway Bot to The Group or Channel
        </Text>
      </Block>
      <Block margin="top" marginValue={12}>
        <Text align="center" type="text">
          Gateway bot require admin access to control who can join the group or
          channel.Telegram bots can’t read messages inside the group chat.
        </Text>
      </Block>
    </PageLayout>
  )
}
