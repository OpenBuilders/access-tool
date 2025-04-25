import styles from './Spinner.module.scss'

interface SpinnerProps {
  size?: number
}

export const Spinner = ({ size = 16 }: SpinnerProps) => {
  return <div className={styles.loader} style={{ width: size, height: size }} />
}
