interface Config {
  isDev?: boolean
  isProd?: boolean
  apiHost: string
  botLink: string
  CDN: string
  tonConnectManifestUrl: string
  accessToken?: string
}

const devConfig: Config = {
  isDev: true,
  apiHost: 'https://gate.essentis.xyz/api',
  botLink: 'https://t.me/megatron999_bot',
  CDN: 'https://stickerbot.fra1.cdn.digitaloceanspaces.com',
  tonConnectManifestUrl: 'https://cdn.stickerdom.store/manifest.json',
  accessToken: import.meta.env.VITE_ACCESS_TOKEN,
}

const prodConfig: Config = {
  isProd: true,
  apiHost: 'https://gate.essentis.xyz/api',
  botLink: 'https://t.me/sticker_bot',
  CDN: 'https://stickerbot.fra1.cdn.digitaloceanspaces.com',
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
