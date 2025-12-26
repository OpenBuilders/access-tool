import { useState } from 'react'
import { DialogModal, ListInput, Text, Block } from '@components'

interface ChatFullControlModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (days: number) => void
    isEnabling: boolean
}

export const ChatFullControlModal = ({
    isOpen,
    onClose,
    onConfirm,
    isEnabling,
}: ChatFullControlModalProps) => {
    const [days, setDays] = useState(0)

    const handleConfirm = () => {
        onConfirm(days)
        setDays(0)
    }

    return (
        <DialogModal
            active={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={isEnabling ? 'Full Chat Management' : 'Disable Full Management'}
            description={
                isEnabling
                    ? 'Specify after how many days the full management will be applied:'
                    : 'Are you sure you want to disable full management for this chat? The bot will stop managing participants.'
            }
            confirmText={isEnabling ? 'Turn On' : 'Disable'}
            closeText="Cancel"
        >
            {isEnabling && (
                <Block>
                    <Block margin="bottom" marginValue={8}>
                        <Text type="caption" color="secondary">
                            Effective in days
                        </Text>
                    </Block>
                    <ListInput
                        type="number"
                        placeholder="0"
                        value={days.toString()}
                        onChange={(val) => setDays(Number(val))}
                    />
                </Block>
            )}
        </DialogModal>
    )
}
