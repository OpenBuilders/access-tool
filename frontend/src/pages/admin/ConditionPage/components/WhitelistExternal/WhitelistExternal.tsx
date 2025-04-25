import { List, ListInput, ListItem, Spinner, Text } from '@components'
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
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let updatedConditionState: Partial<Condition> = {
      type: 'whitelist_external',
      description: condition?.description || '',
      authKey: condition?.authKey || undefined,
      authValue: condition?.authValue || undefined,
      name: condition?.name || '',
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

    setIsLoading(true)
    try {
      const response = await fetch(conditionState.url, {
        headers: {
          Authorization: `${conditionState.authKey} ${conditionState.authValue}`,
        },
      })
      const data = await response.json()
      setApiData(collapseEnd(JSON.stringify(data, null, 1), 200))
    } catch (error) {
      console.error(error)
      showToast({
        message: 'Failed to fetch data from API',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Block margin="top" marginValue={24}>
        <List header="Name and description">
          <ListItem>
            <ListInput
              placeholder="Name"
              value={conditionState.name}
              onChange={(value) => {
                handleChangeCondition('name', value)
              }}
            />
          </ListItem>
          <ListItem>
            <ListInput
              placeholder="Description (optional)"
              value={conditionState.description}
              onChange={(value) => {
                handleChangeCondition('description', value)
              }}
            />
          </ListItem>
        </List>
      </Block>
      <Block margin="top" marginValue={24}>
        <List header="API Endpoint">
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
        <List
          header="API Authorization"
          footer="When any of KEY or VALUE provided, the second value should also be provided"
        >
          <ListItem>
            <ListInput
              placeholder="Key"
              value={conditionState.authKey}
              onChange={(value) => {
                handleChangeCondition('authKey', value)
              }}
            />
          </ListItem>
          <ListItem>
            <ListInput
              placeholder="Value"
              value={conditionState.authValue}
              onChange={(value) => {
                handleChangeCondition('authValue', value)
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
          <ListItem
            text="Response body"
            after={
              <Text type="text" color="tertiary">
                {`{"users": [1, 2, 3]}`}
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
            after={isLoading ? <Spinner /> : null}
          />
          {apiData && <ListItem text={apiData} />}
        </List>
      </Block>
    </>
  )
}
