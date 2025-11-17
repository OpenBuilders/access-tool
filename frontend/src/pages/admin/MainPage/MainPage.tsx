import {
  BlockNew,
  PageLayoutNew,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { Text } from '@components'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './MainPage.module.scss'
import { ChatsBlock } from './components'

export const MainPage = () => {
  const navigate = useNavigate()

  const handleAddChat = useCallback(
    () => navigate('/admin/add-telegram-chat'),
    []
  )

  return (
    <PageLayoutNew>
      <TelegramBackButton hidden />
      <TelegramMainButton text="Add Group or Channel" onClick={handleAddChat} />
      <BlockNew gap={12} className={styles.container}>
        <BlockNew padding="0 16px">
          <Text type="hero" weight="bold">
            Access to Private
            <br />
            Groups & Channels
          </Text>
        </BlockNew>
        <ChatsBlock />
      </BlockNew>
    </PageLayoutNew>
  )
}
