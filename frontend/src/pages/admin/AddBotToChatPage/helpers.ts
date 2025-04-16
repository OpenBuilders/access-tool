import { AdminChat } from '@store'

export const findNewChat = (
  arr1: AdminChat[],
  arr2: AdminChat[],
  key: string
) => {
  const map2 = new Map(arr2.map((item) => [item[key as keyof AdminChat], item]))

  return arr1.filter((item) => !map2.has(item[key as keyof AdminChat]))
}
