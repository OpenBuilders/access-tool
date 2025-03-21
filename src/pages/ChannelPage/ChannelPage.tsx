import { PageLayout } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useParams } from 'react-router-dom'

export const ChannelPage = () => {
  const { channelId } = useParams<{ channelId: string }>()
  const { appNavigate } = useAppNavigation()

  if (!channelId) {
    appNavigate({ path: ROUTES_NAME.MAIN })
  }

  return (
    <PageLayout>
      <div>ChannelPage</div>
    </PageLayout>
  )
}
