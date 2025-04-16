interface Config {
  isDev?: boolean
  isProd?: boolean
  apiHost: string
  botLink: string
  CDN: string
  tonConnectManifestUrl: string
  accessToken?: string
  botName: string
}

const devConfig: Config = {
  isDev: true,
  apiHost: 'https://gate.essentis.xyz/api',
  botName: 'ggooccttaa_bot',
  botLink: 'https://t.me/ggooccttaa_bot',
  CDN: 'https://pub-afc0b291195b4529b0de88319506f30b.r2.dev',
  tonConnectManifestUrl: 'https://cdn.stickerdom.store/manifest.json',
  accessToken: import.meta.env.VITE_ACCESS_TOKEN,
}

const prodConfig: Config = {
  isProd: true,
  apiHost: 'https://gate.essentis.xyz/api',
  botName: 'ggooccttaa_bot',
  botLink: 'https://t.me/ggooccttaa_bot',
  CDN: 'https://pub-afc0b291195b4529b0de88319506f30b.r2.dev',
  tonConnectManifestUrl: 'https://cdn.stickerdom.store/manifest.json',
}

let config

switch (import.meta.env.MODE) {
  case 'production':
    config = { ...prodConfig }
    break
  default:
    config = { ...devConfig }
}

export default config as Config
