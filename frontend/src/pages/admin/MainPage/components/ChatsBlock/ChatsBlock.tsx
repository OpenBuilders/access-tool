import { Block, Dropdown, Icon, TabsContainer } from '@components'
import { ChatsActiveTab, ChatsPopularOrderBy } from '@types'
import { hapticFeedback } from '@utils'
import { useRef, useState } from 'react'

import { useAdminChatsQuery, useChatsPopularQuery } from '@store-new'

import { PopularChatsList } from '../PopularChatsList'
import { UserChatsList } from '../UserChatsList'
import styles from './ChatsBlock.module.scss'
import { Skeleton } from './Skeleton'

export const ChatsBlock = () => {
  const [activeTab, setActiveTab] = useState<ChatsActiveTab>('explore')
  const [orderBy, setOrderBy] = useState<ChatsPopularOrderBy>('tcv')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  const { data: adminChatsData, isLoading: adminChatsIsLoading } =
    useAdminChatsQuery()
  const { data: chatsPopularData, isLoading: chatsPopularIsLoading } =
    useChatsPopularQuery(orderBy)

  const isLoading = chatsPopularIsLoading || adminChatsIsLoading

  const handleChangeActiveTab = (value: ChatsActiveTab) => {
    if (isLoading) return
    hapticFeedback('soft')
    setActiveTab(value)
  }

  const handleChangeOrderBy = (value: ChatsPopularOrderBy) => {
    if (isLoading) return
    hapticFeedback('soft')
    setOrderBy(value)
  }

  const handleToggleDropdown = (value?: boolean) => {
    if (isLoading) return
    hapticFeedback('soft')
    setIsDropdownOpen(value ?? !isDropdownOpen)
  }

  const tabs = [
    { id: 0, label: 'Explore', value: 'explore' },
    { id: 1, label: 'Added', value: 'added' },
  ]

  const activeTabIndex = tabs.findIndex((tab) => tab.value === activeTab)

  const contentSlides = [
    <PopularChatsList chats={chatsPopularData?.items ?? []} />,
    <UserChatsList chats={adminChatsData ?? []} />,
  ]

  return (
    <Block gap={12} className={styles.chatsBlock}>
      <Block justify="between" align="center" row padding="0 16px">
        <TabsContainer
          tabs={tabs}
          activeTab={activeTab}
          onChangeTab={handleChangeActiveTab}
        />
        <div
          className={styles.orderByContainer}
          onClick={() => handleToggleDropdown()}
          ref={buttonRef}
        >
          <Icon name="sortArrows" size={18} />
          <Dropdown
            active={isDropdownOpen}
            options={[
              { label: 'Sort By TVL', value: '-tcv' },
              { label: 'Sort By Subscribers', value: '-users-count' },
            ]}
            selectedValue={orderBy}
            onSelect={(value: string) =>
              handleChangeOrderBy(value as ChatsPopularOrderBy)
            }
            onClose={() => handleToggleDropdown(false)}
            triggerRef={buttonRef}
          />
        </div>
      </Block>

      {isLoading ? (
        <Skeleton />
      ) : (
        <div className={styles.contentWrapper}>
          <div
            className={styles.contentSlider}
            style={{
              transform: `translateX(-${activeTabIndex * 50}%)`,
              width: `${contentSlides.length * 100}%`,
            }}
          >
            {contentSlides.map((slide, index) => (
              <div key={index} className={styles.contentSlide}>
                {slide}
              </div>
            ))}
          </div>
        </div>
      )}
    </Block>
  )
}
