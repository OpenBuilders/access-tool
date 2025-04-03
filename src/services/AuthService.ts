import Config from '@config'

import { LocalStorageService } from './LocalStorageService'

interface AuthServiceCredentials {
  accessToken: string | null
}

const accessTokenName = 'jwt'

export class AuthService {
  static setCredentials(credentials: AuthServiceCredentials) {
    LocalStorageService.setItem(accessTokenName, credentials.accessToken)
  }

  static getCredentials(): AuthServiceCredentials {
    if (Config.isDev && Config.accessToken) {
      return {
        accessToken: Config.accessToken,
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
