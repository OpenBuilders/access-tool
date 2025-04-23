import { separateNumber } from './separateNumber'

export const createMembersCount = (membersCount: number) => {
  let text = 'members'
  if (membersCount === 1) {
    text = 'member'
  }
  return `${separateNumber(membersCount)} ${text}`
}
