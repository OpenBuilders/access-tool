import cs from '@styles/commonStyles.module.scss'
import { Image, Text, Title } from '@telegram-apps/telegram-ui'
import cn from 'classnames'

import config from '@config'
import { useChat } from '@store'

export const ChatHeader = () => {
  const { chat } = useChat()

  return (
    <>
      <Image
        src={`${config.CDN}/${chat?.logoPath}`}
        fallbackIcon={<p>😔</p>}
        size={96}
        className={cs.rounded}
      />
      <div className={cn(cs.mt8, cs.textCenter)}>
        <Title level="1" weight="1" plain>
          {chat?.title}
        </Title>
      </div>
      <div className={cn(cs.mt8, cs.textCenter, cs.colorHint)}>
        <Text>{chat?.description}</Text>
      </div>
    </>
  )
}
