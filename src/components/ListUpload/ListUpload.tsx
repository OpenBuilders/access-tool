import { List, ListItem, Text } from '@components'
import Papa from 'papaparse'
import { useState } from 'react'

import styles from './ListUpload.module.scss'
import { FileData } from './types'

interface ListUploadProps {
  allowedFileTypes: string
  onChange: (file: FileData) => void
  onError: (error: Error) => void
  onSuccess: (file: FileData) => void
  className?: string
  text?: string
  showPreview?: boolean
  uploadedFile?: any
}

export const ListUpload = ({
  allowedFileTypes,
  onChange,
  onError,
  onSuccess,
  className,
  text = 'Upload',
  showPreview = true,
  uploadedFile,
}: ListUploadProps) => {
  const [fileData, setFileData] = useState<FileData | null>({
    name: uploadedFile?.name,
    url: uploadedFile?.url,
    description: uploadedFile?.description,
    users: uploadedFile?.users,
  })

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string)
        } else {
          reject(new Error('Failed to read file'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }

  const parseCSV = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          // results.data будет типа string[][]
          const rawData = results.data as string[][]
          const extractedIds = rawData.map((row) => row[0])
          resolve(extractedIds.join(','))
        },
        error: (error) => {
          reject(new Error('Failed to parse CSV'))
        },
      })
    })
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0]
      if (!file) {
        throw new Error('No file selected')
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (!allowedFileTypes.includes(fileExtension || '')) {
        throw new Error('Invalid file type')
      }

      let content: any

      if (fileExtension === 'csv') {
        content = await parseCSV(file)
        content = JSON.stringify(content.split(','))
      } else {
        content = await readFileContent(file)
      }

      const contentData = JSON.parse(content)

      if (!contentData || !Array.isArray(contentData)) {
        throw new Error('Invalid file content')
      }

      const allNumbers = contentData.every((item: string) => {
        return !isNaN(Number(item))
      })

      if (!allNumbers) {
        throw new Error('Invalid file content')
      }

      // Создаем URL для файла
      const fileUrl = URL.createObjectURL(file)

      const fileData = {
        url: `https://t.me/c/${fileUrl}`,
        name: file.name,
        description: '',
        users: contentData,
      }

      setFileData(fileData)
      onChange(fileData)
      onSuccess(fileData)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        onError(error)
      }
    }
  }

  return (
    <List>
      <ListItem
        text={
          <Text type="text">
            {text}{' '}
            {allowedFileTypes
              .toLocaleUpperCase()
              .replaceAll('.', '')
              .replaceAll(',', ', ')}
          </Text>
        }
        after={
          <Text type="text" color="accent">
            {fileData?.name ? fileData.name : 'Upload'}
          </Text>
        }
      >
        <input
          type="file"
          id="file-upload"
          className={styles.fileInput}
          accept={allowedFileTypes}
          onChange={handleFileChange}
        />
      </ListItem>
      {showPreview && !!fileData?.users?.length && (
        <ListItem text={`${fileData?.users?.length} Users Added`} />
      )}
    </List>
  )
}
