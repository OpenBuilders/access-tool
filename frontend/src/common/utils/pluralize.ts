export const pluralize = (
  textForms: [string, string, string], // [one, few, many]
  multiplier: number // number of items
): string => {
  const mod10 = multiplier % 10
  const mod100 = multiplier % 100

  const prettifiedMultiplier = multiplier.toLocaleString()

  if (mod10 === 1 && mod100 !== 11) {
    return `${prettifiedMultiplier} ${textForms[0]}`
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${prettifiedMultiplier} ${textForms[1]}`
  }
  return `${prettifiedMultiplier} ${textForms[2]}`
}
