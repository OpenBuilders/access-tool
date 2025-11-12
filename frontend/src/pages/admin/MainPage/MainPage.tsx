import {
  Block,
  BlockNew,
  PageLayoutNew,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { Text } from '@components'
import { goTo } from '@utils'
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

  const navigateToToolsPage = () => {
    goTo('https://tools.tg')
  }

  const handleToProjectPage = () => {
    goTo('https://github.com/OpenBuilders/access-tool')
  }

  return (
    <PageLayoutNew>
      <TelegramBackButton />
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
        <BlockNew padding="0 16px">
          <Text align="center" type="caption" color="tertiary">
            This tool is{' '}
            <Text
              type="caption"
              color="accent"
              as="span"
              onClick={handleToProjectPage}
            >
              open source
            </Text>
            , created by independent
            <br />
            developers, as part of
            <Text
              type="caption"
              color="accent"
              as="span"
              onClick={navigateToToolsPage}
            >
              {' '}
              Telegram Tools
            </Text>
          </Text>
        </BlockNew>
      </BlockNew>
    </PageLayoutNew>
  )
}
