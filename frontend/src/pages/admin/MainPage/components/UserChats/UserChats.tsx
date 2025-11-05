import { Block, List, ListItem } from '@components'
import { AdminChat } from '@types'

interface UserChatsProps {
  chats: AdminChat[]
}

export const UserChats = ({ chats }: UserChatsProps) => {
  return (
    <Block>
      <List>
        {chats.map((chat) => (
          <ListItem key={chat.id} text={chat.title} />
        ))}
      </List>
    </Block>
  )
}
