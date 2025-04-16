export const collapseEnd = (text: string, length: number): string => {
  return text.length > length ? `${text.substring(0, length - 3)}...` : text
}
