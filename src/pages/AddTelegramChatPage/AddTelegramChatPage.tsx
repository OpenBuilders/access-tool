import chainLottie from '@assets/chain.json'
import { useAppNavigation } from '@common'
import {
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { ROUTES_NAME } from '@routes'
import { Input, Link, List, Text, Title } from '@telegram-apps/telegram-ui'
import { ChangeEvent, useState } from 'react'

import styles from './AddTelegramChatPage.module.scss'

export const AddTelegramChatPage = () => {
  const { appNavigate } = useAppNavigation()
  const [linkValue, setLinkValue] = useState('')

  const handleChangeLink = (e: ChangeEvent<HTMLInputElement>) => {
    setLinkValue(e.target.value)
  }

  return (
    <PageLayout center>
      <TelegramBackButton
        onClick={() => appNavigate({ path: ROUTES_NAME.MAIN })}
      />
      <TelegramMainButton
        text="Add First Chat"
        onClick={() =>
          appNavigate({
            path: ROUTES_NAME.CHAT_ADD_SUCCESS,
          })
        }
      />
      <StickerPlayer lottie={chainLottie} />
      <Title weight="1" plain level="1" className={styles.title}>
        Add Telegram Chat
      </Title>
      <Text className={styles.text}>
        Enter your Telegram group link or chat ID (e.g. @yourgroup or
        -1001234567890).
      </Text>
      <Link href="#" className={styles.link}>
        Where to find group link or chat ID?
      </Link>
      <List className={styles.list}>
        <Input
          placeholder="Link or chat ID"
          value={linkValue}
          onChange={handleChangeLink}
          className={styles.input}
        />
      </List>
    </PageLayout>
  )
}
