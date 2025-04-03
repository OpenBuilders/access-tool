import { Cell, Input, Section, Text } from '@telegram-apps/telegram-ui'
import { ChangeEvent, useState } from 'react'

import styles from '../../NewConditionPage.module.scss'

export const NFTCondition = () => {
  const [collectionUrl, setCollectionUrl] = useState('')

  const handleChangeCollectionUrl = (e: ChangeEvent<HTMLInputElement>) => {
    setCollectionUrl(e.target.value)
  }
  return (
    <>
      <Section>
        <Cell
          after={
            <Text weight="3" className={styles.grayText}>
              1 NFT
            </Text>
          }
        >
          <Text weight="3">Required balance</Text>
        </Cell>
      </Section>
      <Section className={styles.mt12} header="Collection">
        <Input
          placeholder="Collection URL"
          value={collectionUrl}
          onChange={handleChangeCollectionUrl}
        />
      </Section>
    </>
  )
}
