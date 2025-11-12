export const checkIsMobile = () => {
  const webApp = window?.Telegram?.WebApp

  return {
    isMobile: webApp
      ? webApp?.platform === 'ios' ||
        webApp?.platform === 'android' ||
        webApp?.platform === 'android_x'
      : false,
    isIos: webApp ? webApp?.platform === 'ios' : false,
    isAndroid: webApp
      ? webApp?.platform === 'android' || webApp?.platform === 'android_x'
      : false,
  }
}
