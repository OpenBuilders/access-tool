import { useToast } from '@components'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { API_ERRORS } from '@utils'
import { PropsWithChildren, useMemo } from 'react'

const HIDDEN_ERRORS = ['user_forbidden', 'synced_recently', 'TON_CONNECT']

export const TanStackProvider = (props: PropsWithChildren) => {
  const { showToast } = useToast()

  const queryClient = useMemo(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            console.error('[Query error]', { key: query?.queryKey, error })
            if (!HIDDEN_ERRORS?.find((item) => error.message.includes(item))) {
              showToast({
                message:
                  API_ERRORS[error.message as keyof typeof API_ERRORS] ||
                  error.message,
                type: 'error',
              })
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            console.error('[Mutation error]', {
              key: mutation?.options?.mutationKey,
              error,
            })
            if (!HIDDEN_ERRORS?.find((item) => error.message.includes(item))) {
              let message = (error as any)?.message
              message = message?.toLocaleLowerCase()?.includes('rate limit')
                ? 'rate_limit'
                : message

              showToast({
                message:
                  API_ERRORS[message as keyof typeof API_ERRORS] || message,
                type: 'error',
              })
            }
          },
        }),
        defaultOptions: {
          queries: {
            retry: false,
            throwOnError: false,
            retryOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
          mutations: {
            retry: false,
            throwOnError: false,
          },
        },
      }),
    [showToast]
  )

  const persister = useMemo(
    () =>
      createAsyncStoragePersister({
        key: 'tanstack-query-cache',
        storage: {
          getItem: async (key: string) => {
            try {
              return sessionStorage.getItem(key)
            } catch (e) {
              console.error('[Persist getItem error]', e)
              return null
            }
          },
          setItem: async (key: string, value: unknown) => {
            try {
              sessionStorage.setItem(key, value as string)
            } catch (e: any) {
              const name = e?.name
              const code = e?.code
              const isQuota =
                name === 'QuotaExceededError' ||
                name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
                code === 22 ||
                code === 1014

              if (isQuota) {
                console.warn(
                  '[Persist setItem quota exceeded] Skipping persistence for key:',
                  key
                )
                return
              }

              console.error('[Persist setItem error]', e)
              throw e
            }
          },
          removeItem: async (key: string) => {
            try {
              sessionStorage.removeItem(key)
            } catch (e) {
              console.error('[Persist removeItem error]', e)
            }
          },
        },
      }),
    [showToast]
  )

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: persister,
        maxAge: 60 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateQuery: (q) =>
            q.state.status === 'success' && q.meta?.persist === true,
        },
      }}
    >
      {props.children}
    </PersistQueryClientProvider>
  )
}
