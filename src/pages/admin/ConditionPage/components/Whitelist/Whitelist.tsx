import {
  Block,
  FileData,
  List,
  ListItem,
  ListUpload,
  Text,
  useToast,
} from '@components'
import cn from 'classnames'

import {
  ConditionWhitelistExternal,
  useCondition,
  useConditionActions,
} from '@store'

import { ConditionComponentProps } from '../types'

// import { validateWhitelistExternalCondition } from './helpers'

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
    handleChangeConditionFieldAction('users', JSON.stringify(file.users))
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
              <li>JSON — array of strings or numbers (e.g. ["123", "456"])</li>
              <li>TXT — plain text with one ID per line or valid JSON array</li>
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
