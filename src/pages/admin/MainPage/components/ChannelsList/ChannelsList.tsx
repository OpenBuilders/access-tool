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

import config from '@config'
import { UserChat } from '@store'

interface ChannelsListProps {
  channels: UserChat[]
}

export const ChannelsList = ({ channels }: ChannelsListProps) => {
  const { appNavigate } = useAppNavigation()
  return (
    <Container className={commonStyles.mt24}>
      <Section header="Groups & Channels">
        {channels.map((channel) => (
          <Navigation key={channel.id} className={commonStyles.pr12}>
            <Cell
              before={
                <Avatar size={40} src={`${config.CDN}/${channel.logoPath}`} />
              }
              description="1,232 members"
              className={commonStyles.py10}
              onClick={() =>
                appNavigate({
                  path: ROUTES_NAME.CHAT,
                  params: { chatSlug: channel.slug },
                })
              }
            >
              <Text className={commonStyles.colorPrimary}>{channel.title}</Text>
            </Cell>
          </Navigation>
        ))}
      </Section>
    </Container>
  )
}
