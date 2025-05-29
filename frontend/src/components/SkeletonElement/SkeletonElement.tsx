import styles from './SkeletonElement.module.scss'

interface SkeletonElementProps {
  style?: React.CSSProperties
}

export const SkeletonElement = ({ style }: SkeletonElementProps) => {
  return <div className={styles.skeletonElement} style={style} />
}
