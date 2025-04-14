import sneezeLottie from '@assets/sneeze.json'
import {
  Block,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { PageLayout } from '@components'

const webApp = window.Telegram.WebApp

export const NotFound = () => {
  const handleCloseApp = () => {
    webApp.close()
  }

  return (
    <PageLayout center>
      <TelegramBackButton />
      <TelegramMainButton text="Close" onClick={handleCloseApp} />
      <StickerPlayer lottie={sneezeLottie} />
      <Block margin="top" marginValue={16}>
        <Text type="title" align="center" weight="bold">
          Something Went Wrong
        </Text>
      </Block>
      <Block margin="top" marginValue={12}>
        <Text type="text" align="center">
          The page you’re looking for doesn’t exist or the link is broken. But
          don’t worry — you’re still in the right universe.
        </Text>
      </Block>
    </PageLayout>
  )
}
