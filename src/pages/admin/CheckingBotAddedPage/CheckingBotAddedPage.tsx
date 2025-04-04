import sandwatchLottie from '@assets/sandwatch.json'
import commonStyles from '@common/styles/commonStyles.module.scss'
import {
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import '@styles/index.scss'
import { Title, Text } from '@telegram-apps/telegram-ui'
import cn from 'classnames'

export const CheckingBotAddedPage = () => {
  const { appNavigate } = useAppNavigation()

  return (
    <PageLayout center>
      <TelegramBackButton
        onClick={() => appNavigate({ path: ROUTES_NAME.MAIN })}
      />
      <TelegramMainButton hidden />
      <StickerPlayer lottie={sandwatchLottie} />
      <Title
        weight="1"
        plain
        level="1"
        className={cn(commonStyles.textCenter, commonStyles.mt16)}
      >
        Checking If the Bot Was
        <br />
        Added to Your Group or Channel
      </Title>
      <Text className={cn(commonStyles.textCenter, commonStyles.mt12)}>
        Gateway bot require admin access to control who can join the group or
        channel.Telegram bots can’t read messages inside the group chat.
      </Text>
    </PageLayout>
  )
}
