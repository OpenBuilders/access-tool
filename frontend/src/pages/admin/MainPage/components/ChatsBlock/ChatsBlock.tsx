import { Block, TabsContainer } from '@components'
import { ChatsActiveTab, ChatsPopularSortBy } from '@types'
import { goTo } from '@utils'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAdminChatsQuery, useChatsPopularQuery } from '@store-new'

import { PopularChats } from '../PopularChats'
import { UserChats } from '../UserChats'
import styles from './ChatsBlock.module.scss'

export const ChatsBlock = () => {
  const [activeTab, setActiveTab] = useState<ChatsActiveTab>('explore')
  const [sortBy, setSortBy] = useState<ChatsPopularSortBy>('tcv')

  const { data: adminChatsData, isLoading: adminChatsIsLoading } =
    useAdminChatsQuery()
  const { data: chatsPopularData, isLoading: chatsPopularIsLoading } =
    useChatsPopularQuery(sortBy)

  const isLoading = chatsPopularIsLoading || adminChatsIsLoading

  if (isLoading) {
    return <p>is loading...</p>
  }

  const handleChangeActiveTab = (value: ChatsActiveTab) => {
    setActiveTab(value)
  }

  const handleChangeSortBy = (value: ChatsPopularSortBy) => {
    setSortBy(value)
  }

  return (
    <Block>
      <Block justify="between" align="center" row>
        <TabsContainer
          tabs={[
            { label: 'Explore', value: 'explore' },
            { label: 'Added', value: 'added' },
          ]}
          activeTab={activeTab}
          onChangeTab={handleChangeActiveTab}
        />
        <div>block</div>
      </Block>
      <Block margin="top" marginValue={12}>
        {activeTab === 'explore' && (
          <PopularChats chats={chatsPopularData?.items || []} />
        )}
        {activeTab === 'added' && <UserChats chats={adminChatsData || []} />}
      </Block>
    </Block>
  )
}
