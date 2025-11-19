import sneezeLottie from '@assets/sneeze.json'
import {
  Block,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { PageLayout } from '@components'

const webApp = window.Telegram?.WebApp

export const ClientChatHidden = () => {
  const handleCloseApp = () => {
    webApp?.close()
  }

  return (
    <PageLayout center>
      <TelegramBackButton />
      <TelegramMainButton text="Close" onClick={handleCloseApp} />
      <StickerPlayer lottie={sneezeLottie} />
      <Block margin="top" marginValue={16}>
        <Text type="title" align="center" weight="bold">
          Chat or Channel Access Is Temporarily Disabled
        </Text>
      </Block>
      <Block margin="top" marginValue={12}>
        <Text type="text" align="center">
          The admin has temporarily hidden this chat or channel. Please try
          again later or contact them directly.
        </Text>
      </Block>
    </PageLayout>
  )
}
