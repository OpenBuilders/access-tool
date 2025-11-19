import { Text } from '@components'

import styles from './Group.module.scss'

interface GroupProps {
  children: React.ReactNode
  header?: string
  footer?: React.ReactNode | string
  action?: React.ReactNode
}

export const Group = ({ children, header, footer, action }: GroupProps) => {
  return (
    <>
      {header && (
        <div className={styles.header}>
          <div className={styles.headerText}>
            <Text type="caption" color="secondary" uppercase>
              {header}
            </Text>
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
      <div className={styles.group}>{children}</div>
      {footer && (
        <div className={styles.footer}>
          <Text type="caption" color="secondary">
            {footer}
          </Text>
        </div>
      )}
    </>
  )
}
