// ch - chat/channel

export const parseTGUrlParams = (str: string | null) => {
  const splittedString = str?.split('_')

  if (!splittedString)
    return {
      ch: null,
    }

  const ch = splittedString?.findIndex((item) => item === 'ch')

  const chParam = (ch !== -1 && splittedString[ch + 1]) || null

  return { chParam }
}

export const getUrlStartappParam = () => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  return (
    urlSearchParams?.get('tgWebAppStartParam') ||
    urlSearchParams?.get('startapp')
  )
}

export const checkStartAppParams = () => {
  const startapp = getUrlStartappParam()
  const { chParam } = parseTGUrlParams(startapp)

  if (chParam) {
    return chParam
  }
}
