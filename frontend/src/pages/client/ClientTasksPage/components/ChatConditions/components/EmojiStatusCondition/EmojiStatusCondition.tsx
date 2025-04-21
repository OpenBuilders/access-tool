import { ListItem, Text } from '@components'

const webApp = window.Telegram.WebApp

export const EmojiStatusCondition = () => {
  const handleEmojiStatus = () => {
    webApp?.setEmojiStatus('👍', (status: boolean) => {
      console.log('status', status)
    })
  }
  return (
    <ListItem
      chevron
      onClick={handleEmojiStatus}
      //   before={<Icon name="check" size={24} />}
      text={
        <Text type="text" color="tertiary">
          Test Emoji status
        </Text>
      }
    />
  )
}
