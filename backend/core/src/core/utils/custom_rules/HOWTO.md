# How to add new custom rules

If you want to add custom rules for some collections, 
make sure to do the following steps:

## Adding a new collection

1. Add Collection to the `NftCollectionAsset` enum so it'll be available as a collection handled in a custom way.
2. Create a new categories enum in `core/enums/nft.py` similar to `TelegramUsernameCategory` where you'll define the categories that will be available for selection
   1. Add categories to `NftCollectionCategoryType` (to ensure proper validation of the payload) and `ASSET_TO_CATEGORY_TYPE_MAPPING` (so it'll be possible to map your asset to the new category)

## Adding new categories to existing collections
1. Find an appropriate enum in the `core/enums/nft.py`
2. Add a new category
3. Create a new method in `core/utils/custom_rules` that will handle your custom logic
4. Add a new mapping to your method into the `CATEGORY_TO_METHOD_MAPPING` (`core/utils/custom_rules/mapping.py`)

Each method used in the custom rules should accept a list of NFT items and return a list of valid NFT items according to the logic.

E.g.:
```python
def custom_logic(nft_items: list[NftItem]) -> list[NftItem]:
    # do something
    return list_of_valid_nft_items
```
