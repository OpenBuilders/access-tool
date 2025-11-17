import { BlockNew, Dropdown, Icon, TabsContainer } from '@components'
import { ChatsActiveTab, ChatsPopularOrderBy } from '@types'
import { hapticFeedback } from '@utils'
import cn from 'classnames'
import { useEffect, useRef, useState } from 'react'

import { useAdminChatsQuery, useChatsPopularQuery } from '@store-new'

import { PopularChatsList } from '../PopularChatsList'
import { UserChatsList } from '../UserChatsList'
import styles from './ChatsBlock.module.scss'
import { Skeleton } from './Skeleton'

export const ChatsBlock = () => {
  const [activeTab, setActiveTab] = useState<ChatsActiveTab>('explore')
  const [orderBy, setOrderBy] = useState<ChatsPopularOrderBy>('-tcv')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  const { data: adminChatsData, isLoading: adminChatsIsLoading } =
    useAdminChatsQuery()
  const { data: chatsPopularData, isLoading: chatsPopularIsLoading } =
    useChatsPopularQuery(orderBy)

  const isLoading = chatsPopularIsLoading || adminChatsIsLoading

  useEffect(() => {
    const addedElement = document.getElementById(`added-container`)
    const exploreElement = document.getElementById(`explore-container`)

    if (!addedElement || !exploreElement) return

    if (activeTab === 'added') {
      addedElement.style.height = '100%'
      setTimeout(() => {
        exploreElement.style.height = '0px'
      }, 300)
    }

    if (activeTab === 'explore') {
      exploreElement.style.height = '100%'
      setTimeout(() => {
        addedElement.style.height = '0px'
      }, 300)
    }
  }, [activeTab])

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
    <BlockNew gap={12} className={styles.chatsBlock}>
      <BlockNew justify="between" align="center" row padding="0 16px">
        <TabsContainer
          tabs={tabs}
          activeTab={activeTab}
          onChangeTab={handleChangeActiveTab}
        />
        <div
          className={cn(
            styles.orderByContainer,
            activeTab !== 'explore' && styles.orderByContainerHide
          )}
          onClick={() => handleToggleDropdown()}
          ref={buttonRef}
        >
          <Icon name="sortArrows" size={18} color="secondary" />
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
      </BlockNew>

      {isLoading ? (
        <Skeleton />
      ) : (
        <div
          className={styles.contentSlider}
          style={{
            transform: `translateX(-${activeTabIndex * 50}%)`,
            width: `${contentSlides.length * 100}%`,
          }}
        >
          {contentSlides.map((slide, index) => (
            <div className={styles.contentSlide} key={index}>
              {slide}
            </div>
          ))}
        </div>
      )}
    </BlockNew>
  )
}
