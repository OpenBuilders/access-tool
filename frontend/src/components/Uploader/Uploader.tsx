import { GroupItem, Spinner, Text } from '@components'
import { FileData } from '@types'
import { collapseEnd } from '@utils'
import Papa from 'papaparse'
import { useEffect, useState } from 'react'

import styles from './Uploader.module.scss'

interface UploaderProps {
  allowedFileTypes: string
  onChange: (file: FileData) => void
  onError: (error: Error) => void
  onSuccess: (file: FileData) => void
  text?: string
  showPreview?: boolean
  uploadedFile?: FileData
}

export const Uploader = ({
  allowedFileTypes,
  onChange,
  onError,
  onSuccess,
  text = 'Upload',
  showPreview = true,
  uploadedFile,
}: UploaderProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [fileData, setFileData] = useState<FileData | null>({
    name: uploadedFile?.name || '',
    url: uploadedFile?.url || '',
    description: uploadedFile?.description || '',
    users: uploadedFile?.users || [],
  })

  useEffect(() => {
    if (uploadedFile) {
      setFileData(uploadedFile)
    }
  }, [uploadedFile])

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
        error: () => {
          reject(new Error('Failed to parse CSV'))
        },
      })
    })
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setIsLoading(true)
      const file = event.target.files?.[0]
      if (!file) {
        throw new Error('No file selected')
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (!allowedFileTypes.includes(fileExtension || '')) {
        throw new Error('Invalid file type')
      }

      let content: string

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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <GroupItem
        main={
          <input
            type="file"
            id="file-upload"
            className={styles.fileInput}
            accept={allowedFileTypes}
            onChange={handleFileChange}
            disabled={isLoading}
          />
        }
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
          isLoading ? (
            <Spinner />
          ) : (
            <Text type="text" color="accent">
              {fileData?.name ? collapseEnd(fileData.name, 14) : 'Upload'}
            </Text>
          )
        }
      />
      {showPreview && !!fileData?.users?.length && (
        <GroupItem text={`${fileData?.users?.length} Users Added`} />
      )}
    </>
  )
}
