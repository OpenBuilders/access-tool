import {
  BlockNew,
  Group,
  GroupInput,
  GroupItem,
  Spinner,
  Text,
  useToast,
} from '@components'
import { useState } from 'react'

import { useCondition, useConditionActions } from '@store-new'

const createUrl = (url: string, authKey: string, authValue: string) => {
  const urlObject = new URL(url)
  if (authKey) urlObject.searchParams.set('authKey', authKey)
  if (authValue) urlObject.searchParams.set('authValue', authValue)
  return urlObject.toString()
}

export const ExternalSource = () => {
  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const { showToast } = useToast()

  const [isTestApiLoading, setIsTestApiLoading] = useState(false)
  const [testApiData, setTestApiData] = useState<{
    data: { users: number[] | string[] } | null
    status: number | null
  }>({
    data: null,
    status: null as number | null,
  })

  const [queries, setQueries] = useState({
    name: condition?.name || null,
    description: condition?.description || null,
    url: condition?.url || null,
    authKey: condition?.authKey || null,
    authValue: condition?.authValue || null,
  })

  const handleUpdateCondition = (key: string, value: string | null) => {
    setQueries({ ...queries, [key]: value })
    updateConditionAction({ [key]: value })
  }

  const handleTestApiCall = async () => {
    if (isTestApiLoading) return

    if (!queries?.url) {
      showToast({
        message: 'Please enter a valid URL',
        type: 'error',
      })
      return
    }

    try {
      setIsTestApiLoading(true)
      const url = createUrl(
        queries?.url || '',
        queries?.authKey || '',
        queries?.authValue || ''
      )
      const response = await fetch(url)
      const data = await response.json()
      console.log(data)
      setTestApiData({ data, status: response.status as number | null })
    } catch (error) {
      console.error(error)
      showToast({
        message: 'Failed to test API call',
        type: 'error',
      })
    } finally {
      setIsTestApiLoading(false)
    }
  }

  console.log(testApiData)

  return (
    <>
      <BlockNew padding="24px 0 0 0">
        <Group header="Name and description">
          <GroupItem
            main={
              <GroupInput
                placeholder="Name"
                value={queries?.name || ''}
                onChange={(value) => handleUpdateCondition('name', value)}
              />
            }
          />
          <GroupItem
            main={
              <GroupInput
                placeholder="Description (optional)"
                value={queries?.description || ''}
                onChange={(value) =>
                  handleUpdateCondition('description', value)
                }
              />
            }
          />
        </Group>
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <Group header="API endpoint">
          <GroupItem
            main={
              <GroupInput
                placeholder="https://example.com/api"
                value={queries?.url || ''}
                onChange={(value) => handleUpdateCondition('url', value)}
              />
            }
          />
        </Group>
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <Group
          header="API Authorization"
          footer="When any of KEY or VALUE provided, the second value should also be provided"
        >
          <GroupItem
            main={
              <GroupInput
                placeholder="Key"
                value={queries?.authKey || ''}
                onChange={(value) => handleUpdateCondition('authKey', value)}
              />
            }
          />
          <GroupItem
            main={
              <GroupInput
                placeholder="Value"
                value={queries?.authValue || ''}
                onChange={(value) => handleUpdateCondition('authValue', value)}
              />
            }
          />
        </Group>
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <Group header="Response must contain">
          <GroupItem
            text="Status"
            after={
              <Text type="text" color="secondary">
                "status": "ok"
              </Text>
            }
          />
          <GroupItem
            text="OR Response code"
            after={
              <Text type="text" color="secondary">
                200
              </Text>
            }
          />
          <GroupItem
            text="Response body"
            after={
              <Text type="text" color="secondary">
                {`{"users": [1, 2, 3]}`}
              </Text>
            }
          />
        </Group>
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <GroupItem
          disabled={isTestApiLoading}
          text={
            <Text type="text" color="accent">
              Test API Call
            </Text>
          }
          onClick={handleTestApiCall}
          after={isTestApiLoading ? <Spinner size={16} /> : null}
        />
      </BlockNew>
      {(testApiData.status || testApiData.data) && (
        <BlockNew padding="24px 0 0 0">
          <Group header="Test API Call Result">
            <GroupItem
              text="Status"
              after={
                <Text type="text" color="secondary">
                  {testApiData.status?.toString() || ''}
                </Text>
              }
            />
            <GroupItem
              main={
                <Text type="text" color="secondary">
                  {JSON.stringify(testApiData.data, null, 2)}
                </Text>
              }
            />
          </Group>
        </BlockNew>
      )}
    </>
  )
}
