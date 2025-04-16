export const goTo = (link: string) => {
  const webApp = window.Telegram.WebApp

  if (link.includes('t.me')) {
    webApp.openTelegramLink(link)
  } else {
    webApp.openLink(link)
  }
}
