import styles from './SkeletonElement.module.scss'

interface SkeletonElementProps {
  width?: string
  height?: string
  borderRadius?: string
}

export const SkeletonElement = ({
  width,
  height,
  borderRadius,
}: SkeletonElementProps) => {
  return (
    <div
      className={styles.skeletonElement}
      style={{ width, height, borderRadius }}
    />
  )
}
