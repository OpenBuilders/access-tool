import commonStyles from '@common/styles/commonStyles.module.scss'
import {
  Block,
  Icon,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useAppNavigation, useError } from '@hooks'
import { ROUTES_NAME } from '@routes'
import '@styles/index.scss'
import cn from 'classnames'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import config from '@config'
import { useChatActions } from '@store'

const webApp = window.Telegram.WebApp

export const GrantPermissionsPage = () => {
  const { chatSlug } = useParams<{ chatSlug: string }>()
  const { appNavigate } = useAppNavigation()
  const { fetchChatAction } = useChatActions()
  const { pageNotFound } = useError()
  const [isLoading, setIsLoading] = useState(false)

  const fetchChat = async () => {
    if (!chatSlug) return
    try {
      await fetchChatAction(chatSlug)
    } catch (error) {
      console.error(error)
      pageNotFound('Chat not found')
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchChat()
    setIsLoading(false)
  }, [chatSlug])

  const navigateToMainPage = () => {
    appNavigate({ path: ROUTES_NAME.MAIN })
  }

  const grantPermissions = () => {
    webApp.openTelegramLink(
      `${config.botLink}?startgroup=&admin=restrict_members+invite_users`
    )
  }

  if (isLoading) return null

  return (
    // <PageLayout center>
    //   <TelegramBackButton
    //     onClick={() => appNavigate({ path: ROUTES_NAME.MAIN })}
    //   />
    //   <TelegramMainButton
    // text="Grant Access"
    // onClick={() => {
    //   webApp.openTelegramLink(
    //     `${config.botLink}?startgroup=&admin=restrict_members+invite_users`
    //   )
    // }}
    //   />
    //   <Icon name="gatewayBot" size={112} />
    //   <Title
    //     weight="1"
    //     plain
    //     level="1"
    //     className={cn(commonStyles.textCenter, commonStyles.mt16)}
    //   >
    // Gateway Bot Has
    // <br />
    // No Permissions
    //   </Title>
    //   <Text className={cn(commonStyles.textCenter, commonStyles.mt12)}>
    // The bot was added but doesn't have permissions yet. Please grant
    // permissions.
    //   </Text>
    // </PageLayout>
    <PageLayout center>
      <TelegramBackButton onClick={navigateToMainPage} />
      <TelegramMainButton text="Grant Access" onClick={grantPermissions} />
      <Icon name="gatewayBot" size={112} />
      <Block margin="top" marginValue={16}>
        <Text type="title" align="center" weight="bold">
          Gateway Bot Has No Permissions
        </Text>
      </Block>
      <Block margin="top" marginValue={12}>
        <Text align="center" type="text">
          The bot was added but doesn't have permissions yet. Please grant
          permissions.
        </Text>
      </Block>
    </PageLayout>
  )
}
