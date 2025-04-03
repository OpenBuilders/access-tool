import { Container, Icon } from '@components'
import {
  Avatar,
  AvatarStack,
  Input,
  List,
  Text,
  Title,
} from '@telegram-apps/telegram-ui'
import cn from 'classnames'
import { ChangeEvent, useState } from 'react'

import styles from './ChannelHeader.module.scss'

export const ChannelHeader = () => {
  const [description, setDescription] = useState('')

  const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  return (
    <>
      <Icon name="pixel" size={100} />
      {/* <Title level="1" weight="1" plain className={styles.title}>
        Not Pixel Holders
      </Title>
      <div className={styles.members}>
        <AvatarStack>
          {[
            <Avatar
              key="avatar-1"
              size={28}
              src="https://avatars.githubusercontent.com/u/84640980?v=4"
            />,
            <Avatar
              key="avatar-2"
              size={28}
              src="https://avatars.githubusercontent.com/u/1234567?v=4"
            />,
          ]}
        </AvatarStack>
        <Text className={styles.membersText}>24 members</Text>
      </div>

      <Container margin="24-0-0">
        <Input
          placeholder="Short Description"
          value={description}
          onChange={handleChangeDescription}
        />
      </Container> */}
    </>
  )
}
