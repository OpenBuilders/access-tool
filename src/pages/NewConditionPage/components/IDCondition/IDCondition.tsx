import {
  Cell,
  FileInput,
  Input,
  Section,
  Text,
} from '@telegram-apps/telegram-ui'
import { ChangeEvent, useState } from 'react'

import styles from '../../NewConditionPage.module.scss'

export const IDCondition = () => {
  const [collectionUrl, setCollectionUrl] = useState('')

  const handleChangeCollectionUrl = (e: ChangeEvent<HTMLInputElement>) => {
    setCollectionUrl(e.target.value)
  }
  return (
    <>
      <Section>
        <FileInput
          onChange={() => {}}
          label="Upload"
          className={styles.uploadInput}
        >
          <Cell>
            <Text weight="3">Upload CSV or JSON</Text>
          </Cell>
        </FileInput>
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
