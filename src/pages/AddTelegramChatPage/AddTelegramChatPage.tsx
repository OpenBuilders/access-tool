import chainLottie from '@assets/chain.json'
import {
  Container,
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import * as st from '@styles/commonStyles.scss'
import '@styles/index.scss'
import { Input, Link, List, Text, Title } from '@telegram-apps/telegram-ui'
import cn from 'classnames'
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
      <Title weight="1" plain level="1">
        Add Telegram Chat
      </Title>
      <Text className={st.mt24}>
        Enter your Telegram group link or chat ID (e.g. @yourgroup or
        -1001234567890).
      </Text>
      <Link href="#">Where to find group link or chat ID?</Link>
      <Container margin="24-0-0">
        <Input
          placeholder="Link or chat ID"
          value={linkValue}
          onChange={handleChangeLink}
          // className={styles.input}
        />
      </Container>
    </PageLayout>
  )
}
