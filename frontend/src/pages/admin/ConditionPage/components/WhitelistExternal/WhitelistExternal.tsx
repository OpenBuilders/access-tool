import { List, ListInput, ListItem, Text } from '@components'
import { Block, useToast } from '@components'
import { collapseEnd } from '@utils'
import { useEffect, useState } from 'react'

import { Condition } from '@store'

import { ConditionComponentProps } from '../types'

export const WhitelistExternal = ({
  isNewCondition,
  handleChangeCondition,
  conditionState,
  setInitialState,
  condition,
}: ConditionComponentProps) => {
  const { showToast } = useToast()
  const [apiData, setApiData] = useState<string | null>(null)

  useEffect(() => {
    let updatedConditionState: Partial<Condition> = {
      type: 'whitelist_external',
      description: condition?.description || 'Some description',
      name: condition?.name || 'Custom API',
      url: condition?.url || '',
    }

    if (!isNewCondition) {
      updatedConditionState = {
        ...updatedConditionState,
        isEnabled: !!condition?.isEnabled || true,
      }
    }

    setInitialState(updatedConditionState as Partial<Condition>)
  }, [condition, isNewCondition])

  if (!conditionState?.type) return null

  const handleTestApiCall = async () => {
    if (!conditionState.url) {
      showToast({
        message: 'Please enter a valid URL',
        type: 'error',
      })
      return
    }

    try {
      const response = await fetch(conditionState.url)
      const data = await response.json()
      setApiData(collapseEnd(JSON.stringify(data, null, 2), 200))
      showToast({
        message: 'API call successful',
        type: 'success',
      })
    } catch (error) {
      console.error(error)
      showToast({
        message: 'Failed to fetch data from API',
        type: 'error',
      })
    }
  }

  return (
    <>
      <Block margin="top" marginValue={24}>
        <List header="API Endpoint" footer="This condition is in progress">
          <ListItem>
            <ListInput
              placeholder="https://example.com/api/whitelist"
              value={conditionState.url}
              onChange={(value) => {
                handleChangeCondition('url', value)
              }}
            />
          </ListItem>
        </List>
      </Block>
      <Block margin="top" marginValue={24}>
        <List header="Response must contain">
          <ListItem
            text="Status"
            after={
              <Text type="text" color="tertiary">
                "status": "ok"
              </Text>
            }
          />
          <ListItem
            text="OR Response code"
            after={
              <Text type="text" color="tertiary">
                200
              </Text>
            }
          />
        </List>
      </Block>
      <Block margin="top" marginValue={24}>
        <List>
          <ListItem
            onClick={handleTestApiCall}
            text={
              <Text type="text" color="accent">
                Test API Call
              </Text>
            }
          />
          {apiData && <ListItem text={apiData} />}
        </List>
      </Block>
    </>
  )
}
