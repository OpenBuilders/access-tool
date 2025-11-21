import { ConditionNftCollections } from '@types'

export const getAssetData = (
  assets: ConditionNftCollections[],
  assetId: number | string
) => {
  return (
    assets.find((asset) => asset.id.toString() === assetId.toString()) || null
  )
}

export const getCategoryData = (
  categories: string[],
  categoryId: number | string
) => {
  return (
    categories.find(
      (category) => category.toString() === categoryId.toString()
    ) || null
  )
}
