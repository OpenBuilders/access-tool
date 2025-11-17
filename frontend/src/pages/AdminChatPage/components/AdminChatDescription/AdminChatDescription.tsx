import { Group, GroupInput, GroupItem } from '@components'
import { Chat } from '@types'
import { useState } from 'react'

import { useAdminChatUpdateMutation } from '@store-new'

interface AdminChatDescriptionProps {
  chat?: Chat
}

export const AdminChatDescription = (props: AdminChatDescriptionProps) => {
  const { chat } = props

  const {
    mutateAsync: updateAdminChatMutation,
    isPending: updateAdminChatIsPending,
  } = useAdminChatUpdateMutation(chat?.slug ?? '')

  const [inputValue, setInputValue] = useState(chat?.description ?? '')

  const handleChangeDescription = (value: string) => {
    setInputValue(value)
  }

  const handleUpdateDescription = async () => {
    const trimmedDescription = inputValue.trim()
    if (trimmedDescription === chat?.description || !trimmedDescription) return

    await updateAdminChatMutation({ description: trimmedDescription })
  }

  return (
    <Group header="Description">
      <GroupItem
        main={
          <GroupInput
            value={inputValue}
            placeholder="Your description"
            onChange={handleChangeDescription}
            onBlur={handleUpdateDescription}
            disabled={updateAdminChatIsPending}
          />
        }
      />
    </Group>
  )
}
