export const goTo = (link: string) => {
  const webApp = window.Telegram.WebApp

  if (link.indexOf('t.me') !== -1) {
    webApp.openTelegramLink(link)
  } else {
    webApp.openLink(link)
  }
}
