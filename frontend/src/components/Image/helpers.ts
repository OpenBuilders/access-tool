export const getFirstLetter = (name: string) => {
  return name.charAt(0).toUpperCase()
}

export const getColor = (firstLetter?: string) => {
  const colors = [
    'linear-gradient(180deg, #FF885E 0%, #FF516A 100%)',
    'linear-gradient(180deg, #FFCD6A 0%, #FFA85C 100%)',
    'linear-gradient(180deg, #82B1FF 0%, #665FFF 100%)',
    'linear-gradient(180deg, #A0DE7E 0%, #54CB68 100%)',
    'linear-gradient(180deg, #53EDD6 0%, #28C9B7 100%)',
    'linear-gradient(180deg, #72D5FD 0%, #2A9EF1 100%)',
    'linear-gradient(180deg, #E0A2F3 0%, #D669ED 100%)',
    'linear-gradient(180deg, #A7ADB9 0%, #878B96 100%)',
  ]
  if (!firstLetter) {
    return colors[0]
  }
  const charCode = firstLetter.charCodeAt(0)
  const colorIndex = charCode % colors.length
  return colors[colorIndex]
}
