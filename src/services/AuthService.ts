import config from '@config'

import { LocalStorageService } from './LocalStorageService'

interface AuthServiceCredentials {
  accessToken: string | null
}

const accessTokenName = 'accessToken'

export class AuthService {
  static setCredentials(credentials: AuthServiceCredentials) {
    LocalStorageService.setItem(accessTokenName, credentials.accessToken)
  }

  static getCredentials(): AuthServiceCredentials {
    if (config.isDev && config.accessToken) {
      return {
        accessToken: config.accessToken,
      }
    }

    return {
      accessToken: LocalStorageService.getItem(accessTokenName),
    }
  }

  static isAuth(): boolean {
    return !!AuthService.getCredentials().accessToken
  }

  static clearCredentials() {
    LocalStorageService.setItem(accessTokenName, null)
  }
}
