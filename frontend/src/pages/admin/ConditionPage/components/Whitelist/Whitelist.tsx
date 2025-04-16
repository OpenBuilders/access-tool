import { Block, FileData, List, ListUpload, Text, useToast } from '@components'

import { useCondition, useConditionActions } from '@store'

import { ConditionComponentProps } from '../types'

const ALLOWED_FILE_TYPES = '.csv,.txt,.json'

export const Whitelist = (props: ConditionComponentProps) => {
  const { isNewCondition } = props
  const { condition } = useCondition()
  const { handleChangeConditionFieldAction, setIsValidAction } =
    useConditionActions()

  const { showToast } = useToast()

  const handleChange = (file: FileData) => {
    if (!file.users?.length) {
      return
    }

    handleChangeConditionFieldAction('name', file.name)
    handleChangeConditionFieldAction('description', file.description)
    const users = file.users.map((user) => Number(user))
    handleChangeConditionFieldAction('users', users)
    setIsValidAction(true)
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
          uploadedFile={condition}
          showPreview
        />
      </List>
    </Block>
  )
}
