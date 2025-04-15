export class LocalStorageService {
  static setItem(key: string, value: any, removeIfEmpty = true): void {
    if (removeIfEmpty && (value === null || value === undefined)) {
      return localStorage.removeItem(key)
    }

    if (typeof value === 'string') {
      localStorage.setItem(key, value)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  static setItemWithExpiry(key: string, value: any, ttl: number): void {
    const now = new Date()

    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    }
    localStorage.setItem(key, JSON.stringify(item))
  }

  static getItemWithExpiry<T>(key: string): {
    value: T | null
    isExpired: boolean
  } {
    const itemStr = localStorage.getItem(key)

    if (!itemStr) {
      return { value: null, isExpired: false }
    }

    const item = JSON.parse(itemStr)
    const now = new Date()

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key)
      return { value: item.value, isExpired: true }
    }

    return { value: item.value, isExpired: false }
  }

  static getItem<T>(key: string): T | null
  static getItem<T>(key: string, otherwise: T): T
  static getItem<T>(key: string, otherwise?: T): T | null {
    const data: string | null = localStorage.getItem(key)

    if (data !== null) {
      try {
        return JSON.parse(data) as T
      } catch {
        return data as T
      }
    }

    if (otherwise) {
      return otherwise
    }

    return null
  }
}
