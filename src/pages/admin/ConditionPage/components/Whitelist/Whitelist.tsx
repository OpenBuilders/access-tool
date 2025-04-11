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

  // const readFileContent = (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader()

  //     reader.onload = (event) => {
  //       if (event.target?.result) {
  //         resolve(event.target.result as string)
  //       } else {
  //         reject(new Error('Не удалось прочитать файл'))
  //       }
  //     }

  //     reader.onerror = () => {
  //       reject(new Error('Ошибка при чтении файла'))
  //     }

  //     reader.readAsText(file)
  //   })
  // }

  // const handleChangeConditionField = async (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const file = event.target.files?.[0]
  //   if (!file) {
  //     throw new Error('No file selected')
  //   }

  //   const fileExtension = file.name.split('.').pop()?.toLowerCase()
  //   if (!['csv', 'txt', 'json'].includes(fileExtension || '')) {
  //     throw new Error('Invalid file type')
  //   }

  //   try {
  //     const content = await readFileContent(file)

  //     const isValid = validateWhitelistExternalCondition(content)

  //     if (!isValid) {
  //       throw new Error('Invalid file content')
  //     }

  //     // Создаем URL для файла
  //     const fileUrl = URL.createObjectURL(file)

  //     const fileData = {
  //       url: `https://t.me/c/${fileUrl}`,
  //       name: file.name,
  //       description: '',
  //     }

  //     // TODO: поправить ошибку с ссылкой на файл

  //     handleChangeConditionFieldAction('url', fileData.url)
  //     handleChangeConditionFieldAction('name', fileData.name)
  //     handleChangeConditionFieldAction('description', fileData.description)
  //     handleChangeConditionFieldAction('users', JSON.parse(content))
  //     setIsValidAction(true)
  //   } catch (error) {
  //     console.error(error)
  //     if (error instanceof Error) {
  //       showToast({
  //         message: error.message || 'Unknown error',
  //         type: 'error',
  //       })
  //     }
  //     setIsValidAction(false)
  //   }
  // }

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
          showPreview
        />
        {/* <ListItem
          text="Upload CSV, JSON or TXT"
          after={
            <Text type="text" color="accent">
              Upload
            </Text>
          }
        /> */}
      </List>
    </Block>
  )

  // let UploadComponent = (
  //   <Section
  //     className={cs.mt24}
  //     footer={
  //       <Caption className={cn(cs.pl16, cs.colorHint)}>
  //         Supported formats:
  //         <ul className={cs.pl32}>
  //           <li>CSV — one ID per line, no header</li>
  //           <li>JSON — array of strings or numbers (e.g. ["123", "456"])</li>
  //           <li>TXT — plain text with one ID per line or valid JSON array</li>
  //         </ul>
  //       </Caption>
  //     }
  //   >
  //     <Cell
  //       after={
  //         <FileInput
  //           className={styles.upload}
  //           onChange={handleChangeConditionField}
  //           label="Upload"
  //           accept={ALLOWED_FILE_TYPES}
  //         />
  //       }
  //     >
  //       Upload CSV, JSON or TXT
  //     </Cell>
  //   </Section>
  // )

  // if (!!(condition as ConditionWhitelistExternal)?.users?.length) {
  //   UploadComponent = (
  //     <Section
  //       className={cs.mt24}
  //       footer={
  //         <Caption className={cn(cs.pl16, cs.colorHint)}>
  //           Supported formats:
  //           <ul className={cs.pl32}>
  //             <li>CSV — one ID per line, no header</li>
  //             <li>JSON — array of strings or numbers (e.g. ["123", "456"])</li>
  //             <li>TXT — plain text with one ID per line or valid JSON array</li>
  //           </ul>
  //         </Caption>
  //       }
  //     >
  //       <Cell
  //         after={
  //           <FileInput
  //             className={styles.upload}
  //             onChange={handleChangeConditionField}
  //             label="Change file"
  //             accept={ALLOWED_FILE_TYPES}
  //           />
  //         }
  //       >
  //         Upload CSV, JSON or TXT
  //       </Cell>
  //       <Cell>
  //         {(condition as ConditionWhitelistExternal)?.users?.length} Users Added
  //       </Cell>
  //     </Section>
  //   )
  // }

  // return UploadComponent
}
