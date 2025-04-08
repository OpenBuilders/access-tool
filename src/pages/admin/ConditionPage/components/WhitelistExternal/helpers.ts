export const validateWhitelistExternalCondition = (content: string) => {
  const data = JSON.parse(content)

  if (!data) return false

  const allNumbers = data.every((item: string) => {
    return !isNaN(Number(item))
  })

  return allNumbers
}
