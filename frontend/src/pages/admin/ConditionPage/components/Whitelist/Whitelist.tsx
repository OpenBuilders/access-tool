import { Block, FileData, List, ListUpload, Text, useToast } from '@components'
import { useEffect } from 'react'

import { Condition } from '@store'

import { ConditionComponentProps } from '../types'
import { Skeleton } from './Skeleton'

const ALLOWED_FILE_TYPES = '.csv,.txt,.json'

export const Whitelist = ({
  isNewCondition,
  handleChangeCondition,
  conditionState,
  setInitialState,
  condition,
}: ConditionComponentProps) => {
  const { showToast } = useToast()

  useEffect(() => {
    let updatedConditionState: Partial<Condition> = {
      type: 'whitelist',
      description: condition?.description || '',
      name: condition?.name || '',
      users: condition?.users || [],
    }

    if (!isNewCondition) {
      updatedConditionState = {
        ...updatedConditionState,
        isEnabled: !!condition?.isEnabled || true,
      }
    }

    setInitialState(updatedConditionState as Partial<Condition>)
  }, [condition, isNewCondition])

  if (!conditionState?.type) {
    return <Skeleton />
  }

  const handleChange = (file: FileData) => {
    if (!file.users?.length) {
      return
    }

    handleChangeCondition('name', file.name)
    handleChangeCondition('description', file.description)
    const users = file.users.map((user) => Number(user))
    handleChangeCondition('users', users)
  }

  const handleError = (error: Error) => {
    showToast({
      message: error.message || 'Unknown error',
      type: 'error',
    })
  }

  const handleSuccess = () => {
    showToast({
      message: 'File uploaded successfully',
      type: 'success',
    })
  }

  return (
    <Block margin="top" marginValue={24}>
      <List
        footer={
          <Text type="caption" color="tertiary" as="div">
            Supported formats:
            <ul style={{ paddingLeft: '16px' }}>
              <li>CSV — one ID per line, no header</li>
              <li>JSON — array of strings or numbers (e.g. [123, 456])</li>
              <li>TXT — plain text with array of numbers (e.g. [123, 456])</li>
            </ul>
          </Text>
        }
      >
        <ListUpload
          allowedFileTypes={ALLOWED_FILE_TYPES}
          onChange={handleChange}
          onError={handleError}
          onSuccess={handleSuccess}
          uploadedFile={conditionState as FileData}
          showPreview
        />
      </List>
    </Block>
  )
}
