import { AppSelect, Container } from '@components'
import cs from '@styles/commonStyles.module.scss'
import { Cell, Input, Section, Text } from '@telegram-apps/telegram-ui'
import cn from 'classnames'

import { CONDITION_TYPES } from '../../constants'
import { JETTONS_CATEGORIES } from './constants'

export const Jettons = () => {
  const currentType = CONDITION_TYPES.find((type) => type.value === 'jettons')
  return (
    <>
      <Section>
        <Cell
          after={
            <AppSelect options={CONDITION_TYPES} value={currentType?.value} />
          }
        >
          Choose type
        </Cell>
      </Section>
      <Section className={cs.mt24}>
        <Cell after={<AppSelect options={JETTONS_CATEGORIES} />}>Category</Cell>
      </Section>
      <Section className={cs.mt24}>
        <Cell
          after={
            <Input
              className={cs.afterInput}
              after={<Text className={cs.colorHint}>TON</Text>}
            />
          }
        >
          Amount
        </Cell>
      </Section>
    </>
  )
}
