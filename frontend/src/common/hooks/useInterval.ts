import { useEffect, useRef } from 'react'

interface UseIntervalOptions {
  enabled?: boolean
  immediate?: boolean
}

export const useInterval = (
  callback: () => void,
  delay: number,
  options: UseIntervalOptions = {}
) => {
  const { enabled = true, immediate = false } = options
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const tick = () => savedCallback.current()

    if (immediate) {
      tick()
    }

    const id = setInterval(tick, delay)

    return () => clearInterval(id)
  }, [delay, enabled])

  return savedCallback.current
}
