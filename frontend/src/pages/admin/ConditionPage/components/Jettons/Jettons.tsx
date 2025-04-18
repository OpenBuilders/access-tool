import {
  AppSelect,
  Block,
  Image,
  List,
  ListInput,
  ListItem,
  TelegramMainButton,
  Text,
  useToast,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { removeEmptyFields } from '@utils'
import debounce from 'debounce'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  useCondition,
  useConditionActions,
  ConditionCategory,
  Condition,
} from '@store'

import { ConditionComponentProps } from '../types'

export const Jettons = ({ isNewCondition }: ConditionComponentProps) => {
  const params = useParams<{
    chatSlug: string
    conditionId: string
  }>()
  const chatSlugParam = params.chatSlug || ''
  const conditionIdParam = params.conditionId

  const { condition, prefetchedConditionData } = useCondition()
  const {
    resetPrefetchedConditionDataAction,
    fetchConditionCategoriesAction,
    createConditionAction,
    updateConditionAction,
    prefetchConditionDataAction,
  } = useConditionActions()

  const { appNavigate } = useAppNavigation()

  const { showToast } = useToast()

  const [conditionState, setConditionState] =
    useState<Partial<Condition> | null>(null)
  const [categories, setCategories] = useState<ConditionCategory[]>([])

  const prefetchJetton = async (address: string) => {
    try {
      await prefetchConditionDataAction('jetton', address)
    } catch (error) {
      console.error(error)
      resetPrefetchedConditionDataAction()
    }
  }
  const debouncedPrefetchJetton = useCallback(
    debounce(async (address?: string) => {
      if (!address) {
        resetPrefetchedConditionDataAction()
        return
      }
      prefetchJetton(address)
    }, 150),
    []
  )

  const fetchConditionCategories = async () => {
    try {
      const result = await fetchConditionCategoriesAction('jetton')

      if (!result) {
        throw new Error('Failed to fetch condition categories')
      }

      setCategories(result)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchConditionCategories()
    return () => resetPrefetchedConditionDataAction()
  }, [])

  useEffect(() => {
    if (!isNewCondition && condition?.blockchainAddress) {
      prefetchJetton(condition?.blockchainAddress)
    }
  }, [])

  useEffect(() => {
    if (categories?.length) {
      setConditionState({
        type: 'jetton',
        asset: condition?.asset || categories[0].asset,
        category: condition?.category || categories[0].categories[0],
        address: condition?.blockchainAddress || condition?.address || '',
        expected: condition?.expected || '',
        isEnabled: isNewCondition ? undefined : condition?.isEnabled,
      })
    }
  }, [condition, categories?.length])

  const navigateToChatPage = () => {
    appNavigate({
      path: ROUTES_NAME.CHAT,
      params: { chatSlug: chatSlugParam },
    })
  }

  if (!conditionState || !categories?.length) return null

  const handleUpdateCondition = async () => {
    if (!conditionIdParam || !chatSlugParam) return
    const data = removeEmptyFields(conditionState)
    try {
      await updateConditionAction({
        type: 'jetton',
        chatSlug: chatSlugParam,
        conditionId: conditionIdParam,
        data,
      })
      showToast({
        message: 'Condition updated successfully',
        type: 'success',
      })
      navigateToChatPage()
    } catch (error) {
      console.error(error)
      showToast({
        message: 'Failed to update condition',
        type: 'error',
      })
    }
  }

  const handleCreateCondition = async () => {
    try {
      const data = removeEmptyFields(conditionState)
      await createConditionAction({
        type: 'toncoin',
        chatSlug: chatSlugParam,
        data,
      })
      navigateToChatPage()
      showToast({
        message: 'Condition created successfully',
        type: 'success',
      })
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        showToast({
          message: error.message,
          type: 'error',
        })
        return
      }

      showToast({
        message: 'Failed to create condition',
        type: 'error',
      })
    }
  }

  const handleChangeCondition = (key: keyof Condition, value: string) => {
    setConditionState({ ...conditionState, [key]: value })
  }

  const handleClick = () => {
    if (isNewCondition) {
      handleCreateCondition()
    } else {
      handleUpdateCondition()
    }
  }

  const buttonText = isNewCondition ? 'Add Condition' : 'Save'

  return (
    <>
      <TelegramMainButton text={buttonText} onClick={handleClick} />
      <Block margin="top" marginValue={24}>
        <List>
          <ListItem
            text="Category"
            after={
              <AppSelect
                onChange={(value) => handleChangeCondition('asset', value)}
                value={conditionState?.asset}
                options={categories.map((asset) => ({
                  value: asset.asset,
                  name: asset.asset,
                }))}
              />
            }
          />
          <ListItem
            text="Category Option"
            after={
              <AppSelect
                onChange={(value) => handleChangeCondition('category', value)}
                value={conditionState?.category}
                options={categories
                  ?.find((asset) => asset.asset === conditionState?.asset)
                  ?.categories.map((category) => ({
                    value: category,
                    name: category,
                  }))}
              />
            }
          />
        </List>
        <Block margin="top" marginValue={24}>
          <List footer="TON (The Open Network)">
            <ListItem>
              <ListInput
                placeholder="Jetton Address"
                value={conditionState.address}
                onChange={(value) => {
                  handleChangeCondition('address', value)
                  debouncedPrefetchJetton(value)
                }}
              />
            </ListItem>
            {prefetchedConditionData && (
              <ListItem
                before={
                  <Image
                    src={prefetchedConditionData?.logoPath}
                    size={40}
                    borderRadius={8}
                  />
                }
                text={
                  <Text type="text" weight="medium">
                    {prefetchedConditionData?.name}
                  </Text>
                }
                description={
                  <Text type="caption" color="tertiary">
                    {prefetchedConditionData?.symbol}
                  </Text>
                }
              />
            )}
          </List>
        </Block>
      </Block>
      <Block margin="top" marginValue={24}>
        <ListItem
          text="Amount"
          after={
            <ListInput
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              textColor="tertiary"
              after={
                prefetchedConditionData ? (
                  <Text type="text" color="tertiary">
                    {prefetchedConditionData?.symbol}
                  </Text>
                ) : null
              }
              value={conditionState?.expected}
              onChange={(value) => handleChangeCondition('expected', value)}
            />
          }
        />
      </Block>
    </>
  )
  // const {
  //   fetchConditionCategoriesAction,
  //   prefetchConditionDataAction,
  //   resetPrefetchedConditionDataAction,
  // } = useConditionActions()
  // const { prefetchedConditionData } = useCondition()
  // const [categories, setCategories] = useState<ConditionCategory[]>([])
  // const prefetchJetton = async (address: string) => {
  //   if (!conditionState?.type) return
  //   try {
  //     await prefetchConditionDataAction('jetton', address)
  //   } catch (error) {
  //     console.error(error)
  //     resetPrefetchedConditionDataAction()
  //   }
  // }
  // const debouncedPrefetchJetton = useCallback(
  //   debounce(async (address?: string) => {
  //     if (!address) {
  //       resetPrefetchedConditionDataAction()
  //       return
  //     }
  //     prefetchJetton(address)
  //   }, 150),
  //   []
  // )
  // const fetchConditionCategories = async () => {
  //   try {
  //     const result = await fetchConditionCategoriesAction('jetton')
  //     if (!result) {
  //       throw new Error('Failed to fetch condition categories')
  //     }
  //     setCategories(result)
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }
  // useEffect(() => {
  // if (!isNewCondition && conditionState?.blockchainAddress) {
  //   prefetchJetton(conditionState?.blockchainAddress)
  // }
  // }, [conditionState])
  // useEffect(() => {
  //   fetchConditionCategories()
  //   if (isNewCondition) {
  //     resetPrefetchedConditionDataAction()
  //   }
  // }, [])
  // useEffect(() => {
  //   if (categories?.length && (isNewCondition || condition)) {
  //     console.log(condition)
  //     let updatedConditionState: Partial<Condition> = {
  //       // ...conditionState,
  // type: 'jetton',
  // asset: condition?.asset || categories[0].asset,
  // category: condition?.category || categories[0].categories[0],
  // address: condition?.blockchainAddress || condition?.address || '',
  // expected: condition?.expected || '',
  //     }
  //     if (!isNewCondition) {
  //       updatedConditionState = {
  //         ...updatedConditionState,
  //         isEnabled: !!condition?.isEnabled || true,
  //       }
  //     }
  //     setInitialState(updatedConditionState as Partial<Condition>)
  //   }
  // }, [categories?.length, condition])
  // if (!categories?.length || !conditionState?.type) return null
  // return (
  //   <>
  //     <Block margin="top" marginValue={24}>
  //       <List>
  //         <ListItem
  //           text="Category"
  //           after={
  //             <AppSelect
  //               onChange={(value) => handleChangeCondition('asset', value)}
  //               value={conditionState?.asset}
  //               options={categories.map((asset) => ({
  //                 value: asset.asset,
  //                 name: asset.asset,
  //               }))}
  //             />
  //           }
  //         />
  //         <ListItem
  //           text="Category Option"
  //           after={
  //             <AppSelect
  //               onChange={(value) => handleChangeCondition('category', value)}
  //               value={conditionState?.category}
  //               options={categories
  //                 ?.find((asset) => asset.asset === conditionState?.asset)
  //                 ?.categories.map((category) => ({
  //                   value: category,
  //                   name: category,
  //                 }))}
  //             />
  //           }
  //         />
  //       </List>
  //       <Block margin="top" marginValue={24}>
  //         <List footer="TON (The Open Network)">
  //           <ListItem>
  //             <ListInput
  //               placeholder="Jetton Address"
  //               value={conditionState.address}
  //               onChange={(value) => {
  //                 handleChangeCondition('address', value)
  //                 debouncedPrefetchJetton(value)
  //               }}
  //             />
  //           </ListItem>
  //           {prefetchedConditionData && (
  //             <ListItem
  //               before={
  //                 <Image
  //                   src={prefetchedConditionData?.logoPath}
  //                   size={40}
  //                   borderRadius={8}
  //                 />
  //               }
  //               text={
  //                 <Text type="text" weight="medium">
  //                   {prefetchedConditionData?.name}
  //                 </Text>
  //               }
  //               description={
  //                 <Text type="caption" color="tertiary">
  //                   {prefetchedConditionData?.symbol}
  //                 </Text>
  //               }
  //             />
  //           )}
  //         </List>
  //       </Block>
  //     </Block>
  //     <Block margin="top" marginValue={24}>
  //       <ListItem
  //         text="Amount"
  //         after={
  //           <ListInput
  //             type="text"
  //             pattern="[0-9]*"
  //             inputMode="numeric"
  //             textColor="tertiary"
  //             after={
  //               prefetchedConditionData ? (
  //                 <Text type="text" color="tertiary">
  //                   {prefetchedConditionData?.symbol}
  //                 </Text>
  //               ) : null
  //             }
  //             value={conditionState?.expected}
  //             onChange={(value) => handleChangeCondition('expected', value)}
  //           />
  //         }
  //       />
  //     </Block>
  //   </>
  // )
}
