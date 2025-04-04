import commonStyles from '@common/styles/commonStyles.module.scss'
import {
  Icon,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import '@styles/index.scss'
import { Title, Text } from '@telegram-apps/telegram-ui'
import cn from 'classnames'

import config from '@config'

const webApp = window.Telegram.WebApp

export const GrantPermissionsPage = () => {
  const { appNavigate } = useAppNavigation()

  return (
    <PageLayout center>
      <TelegramBackButton
        onClick={() => appNavigate({ path: ROUTES_NAME.MAIN })}
      />
      <TelegramMainButton
        text="Grant Access"
        onClick={() => {
          webApp.openTelegramLink(
            `${config.botLink}?startgroup=&admin=restrict_members+invite_users`
          )
        }}
      />
      <Icon name="gatewayBot" size={112} />
      <Title
        weight="1"
        plain
        level="1"
        className={cn(commonStyles.textCenter, commonStyles.mt16)}
      >
        Gateway Bot Has
        <br />
        No Permissions
      </Title>
      <Text className={cn(commonStyles.textCenter, commonStyles.mt12)}>
        The bot was added but doesn't have permissions yet. Please grant
        permissions.
      </Text>
    </PageLayout>
  )
}
