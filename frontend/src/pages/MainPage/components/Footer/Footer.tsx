import { BlockNew, Text } from '@components'
import { goTo } from '@utils'

export const Footer = () => {
  const navigateToToolsPage = () => {
    goTo('https://tools.tg')
  }

  const handleToProjectPage = () => {
    goTo('https://github.com/OpenBuilders/access-tool')
  }
  return (
    <BlockNew padding="16px 0 0 0">
      <Text align="center" type="caption" color="tertiary">
        This tool is{' '}
        <Text
          type="caption"
          color="accent"
          as="span"
          onClick={handleToProjectPage}
        >
          open source
        </Text>
        , created by independent
        <br />
        developers, as part of
        <Text
          type="caption"
          color="accent"
          as="span"
          onClick={navigateToToolsPage}
        >
          {' '}
          Telegram Tools
        </Text>
      </Text>
    </BlockNew>
  )
}
