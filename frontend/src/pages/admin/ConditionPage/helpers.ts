export const createDebouncedPrefetch = (delay: number) => {
  let timeoutId: NodeJS.Timeout

  return (address: string, callback: (address: string) => Promise<void>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      callback(address)
    }, delay)
  }
}
