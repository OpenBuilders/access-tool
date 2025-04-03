import commonStyles from '@common/styles/commonStyles.module.scss'
import { Container, Icon } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import {
  Avatar,
  Cell,
  Navigation,
  Section,
  Text,
} from '@telegram-apps/telegram-ui'

import { Chat, useUser } from '@store'

interface ChannelsListProps {
  channels: Chat[]
}

export const ChannelsList = ({ channels }: ChannelsListProps) => {
  const { appNavigate } = useAppNavigation()
  return (
    <Container className={commonStyles.mt24}>
      <Section header="Groups & Channels">
        {channels.map((channel) => (
          <Navigation
            key={channel.id}
            className={commonStyles.pr12}
            onClick={() =>
              appNavigate({
                path: ROUTES_NAME.CHANNEL,
                params: { channelSlug: channel.slug },
              })
            }
          >
            <Cell
              before={
                <Avatar
                  size={40}
                  src={`https://pub-afc0b291195b4529b0de88319506f30b.r2.dev/${channel.logoPath}`}
                />
              }
              description="1,232 members"
              className={commonStyles.py10}
            >
              <Text className={commonStyles.colorPrimary}>{channel.title}</Text>
            </Cell>
          </Navigation>
        ))}
      </Section>
    </Container>
  )
}
