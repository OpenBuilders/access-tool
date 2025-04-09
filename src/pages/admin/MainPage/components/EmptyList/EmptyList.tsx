import commonStyles from '@common/styles/commonStyles.module.scss'
import { Text } from '@telegram-apps/telegram-ui'
import cn from 'classnames'

export const EmptyList = () => {
  return (
    <Text className={cn(commonStyles.textCenter, commonStyles.mt16)}>
      Connect your Telegram group and set up token-gated access in just a few
      clicks. Control who joins and engage with your private community.
    </Text>
  )
}
