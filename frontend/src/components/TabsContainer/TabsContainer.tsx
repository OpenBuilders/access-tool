import { ChatsActiveTab } from '@types'
import { useEffect, useRef, useState } from 'react'

import styles from './TabsContainer.module.scss'

interface Tab {
  label: string
  value: string
}

interface TabsContainerProps {
  tabs: Tab[]
  activeTab: string
  onChangeTab: (value: ChatsActiveTab) => void
}

export const TabsContainer = ({
  tabs,
  activeTab,
  onChangeTab,
}: TabsContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [sliderStyle, setSliderStyle] = useState({ width: 0, left: 0 })

  const handleChangeTab = (value: ChatsActiveTab) => {
    onChangeTab(value)
  }

  useEffect(() => {
    if (!containerRef.current || !sliderRef.current) return

    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab)
    if (activeIndex === -1) return

    const container = containerRef.current
    const tabsElements = container.querySelectorAll(`.${styles.tab}`)
    const activeTabElement = tabsElements[activeIndex] as HTMLElement

    if (activeTabElement) {
      const containerRect = container.getBoundingClientRect()
      const activeRect = activeTabElement.getBoundingClientRect()

      setSliderStyle({
        width: activeRect.width,
        left: activeRect.left - containerRect.left,
      })
    }
  }, [activeTab, tabs])

  return (
    <div ref={containerRef} className={styles.tabsContainer}>
      <div ref={sliderRef} className={styles.slider} style={sliderStyle} />
      {tabs.map((tab) => (
        <div
          key={tab.value}
          className={styles.tab}
          onClick={() => handleChangeTab(tab.value as ChatsActiveTab)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  )
}
