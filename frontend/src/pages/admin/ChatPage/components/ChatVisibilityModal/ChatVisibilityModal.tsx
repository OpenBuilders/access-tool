import { DialogModal } from '@components'

interface ChatVisibilityModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isEnabled: boolean
}

export const ChatVisibilityModal = ({
    isOpen,
    onClose,
    onConfirm,
    isEnabled,
}: ChatVisibilityModalProps) => {
    return (
        <DialogModal
            active={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={isEnabled ? 'Pause Access' : 'Allow Access'}
            description={
                isEnabled
                    ? 'Are you sure you want to pause access for new users? They will not be able to join until you enable it back.'
                    : 'Are you sure you want to allow access for new users?'
            }
            confirmText={isEnabled ? 'Pause' : 'Allow'}
            closeText="Cancel"
        />
    )
}
