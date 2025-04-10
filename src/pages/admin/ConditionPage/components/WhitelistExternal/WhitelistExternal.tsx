import { useToast } from '@components'
import cs from '@styles/commonStyles.module.scss'
import { Caption, Cell, FileInput, Section } from '@telegram-apps/telegram-ui'
import cn from 'classnames'

import {
  ConditionWhitelistExternal,
  useCondition,
  useConditionActions,
} from '@store'

import { ConditionComponentProps } from '../types'
import styles from './WhitelistExternal.module.scss'
import { validateWhitelistExternalCondition } from './helpers'

const ALLOWED_FILE_TYPES = '.csv,.txt,.json'

interface FileData {
  url: string
  name: string
  description: string
  users?: number[] | string[]
}

export const WhitelistExternal = (props: ConditionComponentProps) => {
  const { isNewCondition } = props
  const { condition } = useCondition()
  const { handleChangeConditionFieldAction, setIsValidAction } =
    useConditionActions()

  const { showToast } = useToast()

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string)
        } else {
          reject(new Error('Не удалось прочитать файл'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Ошибка при чтении файла'))
      }

      reader.readAsText(file)
    })
  }

  const handleChangeConditionField = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) {
      throw new Error('No file selected')
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'txt', 'json'].includes(fileExtension || '')) {
      throw new Error('Invalid file type')
    }

    try {
      const content = await readFileContent(file)

      const isValid = validateWhitelistExternalCondition(content)

      if (!isValid) {
        throw new Error('Invalid file content')
      }

      // Создаем URL для файла
      const fileUrl = URL.createObjectURL(file)

      const fileData = {
        url: `https://t.me/c/${fileUrl}`,
        name: file.name,
        description: '',
      }

      // TODO: поправить ошибку с ссылкой на файл

      handleChangeConditionFieldAction('url', fileData.url)
      handleChangeConditionFieldAction('name', fileData.name)
      handleChangeConditionFieldAction('description', fileData.description)
      handleChangeConditionFieldAction('users', JSON.parse(content))
      setIsValidAction(true)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        showToast({
          message: error.message || 'Unknown error',
          type: 'error',
        })
      }
      setIsValidAction(false)
    }
  }

  return null

  let UploadComponent = (
    <Section
      className={cs.mt24}
      footer={
        <Caption className={cn(cs.pl16, cs.colorHint)}>
          Supported formats:
          <ul className={cs.pl32}>
            <li>CSV — one ID per line, no header</li>
            <li>JSON — array of strings or numbers (e.g. ["123", "456"])</li>
            <li>TXT — plain text with one ID per line or valid JSON array</li>
          </ul>
        </Caption>
      }
    >
      <Cell
        after={
          <FileInput
            className={styles.upload}
            onChange={handleChangeConditionField}
            label="Upload"
            accept={ALLOWED_FILE_TYPES}
          />
        }
      >
        Upload CSV, JSON or TXT
      </Cell>
    </Section>
  )

  if (!!(condition as ConditionWhitelistExternal)?.users?.length) {
    UploadComponent = (
      <Section
        className={cs.mt24}
        footer={
          <Caption className={cn(cs.pl16, cs.colorHint)}>
            Supported formats:
            <ul className={cs.pl32}>
              <li>CSV — one ID per line, no header</li>
              <li>JSON — array of strings or numbers (e.g. ["123", "456"])</li>
              <li>TXT — plain text with one ID per line or valid JSON array</li>
            </ul>
          </Caption>
        }
      >
        <Cell
          after={
            <FileInput
              className={styles.upload}
              onChange={handleChangeConditionField}
              label="Change file"
              accept={ALLOWED_FILE_TYPES}
            />
          }
        >
          Upload CSV, JSON or TXT
        </Cell>
        <Cell>
          {(condition as ConditionWhitelistExternal)?.users?.length} Users Added
        </Cell>
      </Section>
    )
  }

  return UploadComponent
}
