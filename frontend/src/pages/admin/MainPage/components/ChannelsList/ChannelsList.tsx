import { Block, Image, List, ListItem, Text } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { separateNumber } from '@utils'

import { AdminChat } from '@store'

interface ChannelsListProps {
  channels: AdminChat[]
}

export const ChannelsList = ({ channels }: ChannelsListProps) => {
  const { appNavigate } = useAppNavigation()

  const handleClick = (channel: AdminChat) => {
    if (channel.insufficientPrivileges) {
      appNavigate({
        path: ROUTES_NAME.GRANT_PERMISSIONS,
        params: { chatSlug: channel.slug },
      })
      return
    }

    appNavigate({
      path: ROUTES_NAME.CHAT,
      params: { chatSlug: channel.slug },
    })
  }

  return (
    <Block margin="top" marginValue={24}>
      <Block margin="bottom" marginValue={24}>
        <List header="Groups & Channels" separatorLeftGap={40}>
          {channels.map((channel) => {
            return (
              <ListItem
                key={channel.id}
                text={
                  <Text type="text" weight="medium">
                    {channel.title}
                  </Text>
                }
                description={
                  channel.membersCount && (
                    <Text type="caption2" color="tertiary">
                      {separateNumber(channel.membersCount)} members
                    </Text>
                  )
                }
                chevron
                before={
                  <Image
                    src={channel.logoPath}
                    fallback={channel.title}
                    size={40}
                    borderRadius={50}
                  />
                }
                onClick={() => handleClick(channel)}
              />
            )
          })}
        </List>
      </Block>
    </Block>
  )
}
