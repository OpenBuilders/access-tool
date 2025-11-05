import { Block, Image, List, ListItem, Text } from '@components'
import { ChatPopular } from '@types'
import { createMembersCount } from '@utils'

interface PopularChatsProps {
  chats: ChatPopular[]
}

export const PopularChats = ({ chats }: PopularChatsProps) => {
  console.log(chats)
  return (
    <Block>
      <List separatorLeftGap={40}>
        {chats.map((chat) => (
          <ListItem
            key={chat.id}
            chevron
            before={
              <Image
                src={`https://pub-afc0b291195b4529b0de88319506f30b.r2.dev/${chat.logoPath}`}
                size={40}
                borderRadius={50}
              />
            }
            description={
              <Text type="caption2" color="tertiary">
                {createMembersCount(chat.membersCount)}
              </Text>
            }
            text={chat.title}
          />
        ))}
      </List>
    </Block>
  )
}
