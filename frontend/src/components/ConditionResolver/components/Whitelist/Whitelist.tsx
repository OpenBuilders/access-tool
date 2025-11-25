import { BlockNew, Group, Text, Uploader, useToast } from '@components'
import { FileData } from '@types'
import { useState } from 'react'

import { useCondition, useConditionActions } from '@store-new'

const ALLOWED_FILE_TYPES = '.csv,.txt,.json'

export const Whitelist = () => {
  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const { showToast } = useToast()
  console.log(condition)
  const [queries, setQueries] = useState({
    name: condition?.name || null,
    description: condition?.description || null,
    users: condition?.users || null,
  })

  const handleChange = (file: FileData) => {
    if (!file.users?.length) {
      return
    }

    setQueries({
      name: file.name,
      description: file.description,
      users: file.users.map((user) => Number(user)),
    })

    updateConditionAction({
      name: file.name,
      description: file.description,
      users: file.users.map((user) => Number(user)),
    })
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
    <>
      <BlockNew padding="24px 0 0 0">
        <Group
          footer={
            <Text type="caption" color="secondary" as="div">
              <p>Supported formats:</p>
              <ul style={{ paddingLeft: '16px' }}>
                <li>CSV — one ID per line, no header</li>
                <li>JSON — array of strings or numbers (e.g. [123, 456])</li>
                <li>
                  TXT — plain text with array of numbers (e.g. [123, 456])
                </li>
              </ul>
            </Text>
          }
        >
          <Uploader
            allowedFileTypes={ALLOWED_FILE_TYPES}
            onChange={handleChange}
            onError={handleError}
            onSuccess={handleSuccess}
            uploadedFile={queries as FileData}
            showPreview
          />
        </Group>
      </BlockNew>
    </>
  )
}
