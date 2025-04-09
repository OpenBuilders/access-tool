import commonStyles from '@common/styles/commonStyles.module.scss'
import { Block, Container, Icon, Image, List, ListItem } from '@components'
import { Text } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { Avatar, Cell, Navigation, Section } from '@telegram-apps/telegram-ui'
import cn from 'classnames'

import config from '@config'
import { AdminChat } from '@store'

interface ChannelsListProps {
  channels: AdminChat[]
}

export const ChannelsList = ({ channels }: ChannelsListProps) => {
  const { appNavigate } = useAppNavigation()

  const handleClick = (channel: AdminChat) => {
    appNavigate({
      path: ROUTES_NAME.CHAT,
      params: { chatSlug: channel.slug },
    })
  }

  return (
    <Block margin="top" marginValue={24}>
      <List header="Groups & Channels" separatorLeftGap={24}>
        {channels.map((channel) => {
          return (
            <ListItem
              key={channel.id}
              text={
                <Text type="text" weight="medium">
                  {channel.title}
                </Text>
              }
              after={
                <Text type="text" color="tertiary">
                  Ton
                </Text>
              }
              chevron
              before={
                <Image src={channel.logoPath} size={24} borderRadius={50} />
              }
              onClick={() => handleClick(channel)}
            />
          )
        })}
      </List>
    </Block>
    // <Container className={cn(commonStyles.mt24, commonStyles.mb24)}>
    //   <Section header="Groups & Channels">
    //     {channels.map((channel) => (
    //       <Navigation
    //         key={channel.id}
    //         className={cn(commonStyles.py6, commonStyles.pr12)}
    //       >
    //         <Cell
    //           before={
    //             <Avatar size={40} src={`${config.CDN}/${channel.logoPath}`} />
    //           }
    //           description=""
    //           className={commonStyles.py10}
    //           onClick={() =>
    //             appNavigate({
    //               path: ROUTES_NAME.CHAT,
    //               params: { chatSlug: channel.slug },
    //             })
    //           }
    //         >
    //           <Text className={commonStyles.colorPrimary}>{channel.title}</Text>
    //         </Cell>
    //       </Navigation>
    //     ))}
    //   </Section>
    // </Container>
  )
}
