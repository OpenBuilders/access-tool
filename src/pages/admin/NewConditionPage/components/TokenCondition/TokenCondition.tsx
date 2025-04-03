import { Cell, Input, Section, Text } from '@telegram-apps/telegram-ui'
import { ChangeEvent, useState } from 'react'

import styles from '../../NewConditionPage.module.scss'

export const TokenCondition = () => {
  const [contract, setContract] = useState('')

  const handleChangeContract = (e: ChangeEvent<HTMLInputElement>) => {
    setContract(e.target.value)
  }
  return (
    <>
      <Section className={'mt24'}>
        <Cell
          after={
            <Text weight="3" className={styles.grayText}>
              1 token
            </Text>
          }
        >
          <Text weight="3">Required balance</Text>
        </Cell>
      </Section>
      <Section className={styles.mt24}>
        <Input
          placeholder="Token Contract"
          value={contract}
          onChange={handleChangeContract}
        />
      </Section>
      {/* TODO: Add token selector */}
    </>
  )
}
