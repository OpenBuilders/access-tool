import { ListItem, Text } from '@components'

const webApp = window.Telegram.WebApp

export const EmojiStatusCondition = () => {
  const handleEmojiStatus = async () => {
    await webApp?.setEmojiStatus('5368324170671202286', (status: boolean) => {
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
