export const separateNumber = (value: string | number) => {
  const number = value
  return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
