// src/services/ApiService.ts
import ky, { HTTPError, Options } from 'ky'

import config from '@config'

import { AuthService } from './AuthService'

const apiHost = config.apiHost

const STATUS_CODES = [408, 413, 429, 500, 502, 503, 504]

export interface ApiServiceResponse<T> {
  ok: boolean
  error?: string
  data?: T
}

interface ApiOptions extends Options {
  retry?: {
    limit: number
    methods: string[]
    statusCodes: number[]
  }
  cache?: 'force-cache' | 'no-cache' | 'no-store' | 'only-if-cached' | 'reload'
}

interface QueryParams {
  [key: string]: string | number | boolean
}

const handleError = async (
  err: unknown
): Promise<ApiServiceResponse<never>> => {
  if (err instanceof HTTPError) {
    try {
      const errorData = await err.response.json()
      return {
        ok: err.response.ok,
        error: errorData.detail || 'Server error',
      }
    } catch {
      return {
        ok: err.response.ok,
        error: 'Server error',
      }
    }
  }

  if (err instanceof TypeError) {
    return {
      ok: false,
      error: 'No connection to the server',
    }
  }

  return {
    ok: false,
    error: 'An error occurred while executing the request',
  }
}

const api = ky.extend({
  hooks: {
    beforeRequest: [
      (request) => {
        const { accessToken } = AuthService.getCredentials()
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`)
        }
        // console.log('Request:', request.method, request.url)
      },
    ],
    afterResponse: [
      (request, options, response) => {
        // console.log('Response:', response.status, response.url)
        if (response.status === 401) {
          ApiService.after401()
        }
      },
    ],
  },
  cache: 'no-store',
})

export const ApiService = {
  after401: () => {},

  get: async <T>({
    endpoint,
    options = {},
    host,
  }: {
    endpoint: string
    options?: ApiOptions & QueryParams
    host?: string
  }): Promise<ApiServiceResponse<T>> => {
    try {
      const { retry, cache, signal, ...searchParams } = options
      const response = await api
        .get(`${host ?? apiHost}${endpoint}`, {
          searchParams: searchParams as QueryParams,
          retry: retry ?? {
            limit: 3,
            methods: ['get'],
            statusCodes: STATUS_CODES,
          },
          cache,
          signal,
        })
        .json<T>()

      return {
        ok: true,
        data: response,
      }
    } catch (err) {
      return handleError(err)
    }
  },

  post: async <T>({
    endpoint,
    data,
    options = {},
    host,
  }: {
    endpoint: string
    data?: unknown
    options?: ApiOptions & QueryParams
    host?: string
  }): Promise<ApiServiceResponse<T>> => {
    try {
      const { retry, cache, signal, ...searchParams } = options
      const response = await api
        .post(`${host ?? apiHost}${endpoint}`, {
          json: data,
          searchParams: searchParams as QueryParams,
          retry: retry ?? {
            limit: 3,
            methods: ['post'],
            statusCodes: STATUS_CODES,
          },
          cache,
          signal,
        })
        .json<T>()

      return {
        ok: true,
        data: response,
      }
    } catch (err) {
      return handleError(err)
    }
  },

  put: async <T>({
    endpoint,
    data,
    options = {},
    host,
  }: {
    endpoint: string
    data?: unknown
    options?: ApiOptions & QueryParams
    host?: string
  }): Promise<ApiServiceResponse<T>> => {
    try {
      const { retry, cache, signal, ...searchParams } = options
      const response = await api
        .put(`${host ?? apiHost}${endpoint}`, {
          json: data,
          searchParams: searchParams as QueryParams,
          retry: retry ?? {
            limit: 3,
            methods: ['put'],
            statusCodes: STATUS_CODES,
          },
          cache,
          signal,
        })
        .json<T>()

      return {
        ok: true,
        data: response,
      }
    } catch (err) {
      return handleError(err)
    }
  },

  delete: async <T>({
    endpoint,
    options = {},
    host,
  }: {
    endpoint: string
    options?: ApiOptions & QueryParams
    host?: string
  }): Promise<ApiServiceResponse<T>> => {
    try {
      const { retry, cache, signal, ...searchParams } = options
      const response = await api
        .delete(`${host ?? apiHost}${endpoint}`, {
          searchParams: searchParams as QueryParams,
          retry: retry ?? {
            limit: 3,
            methods: ['delete'],
            statusCodes: STATUS_CODES,
          },
          cache,
          signal,
        })
        .json<T>()

      return {
        ok: true,
        data: response,
      }
    } catch (err) {
      return handleError(err)
    }
  },
}
