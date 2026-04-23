import { ActionButton } from '../../../../shared/ui'

type ThoughtsEmptyStateProps = {
  onReset: () => void
}

export function ThoughtsEmptyState({ onReset }: ThoughtsEmptyStateProps) {
  return (
    <div className="thoughts-empty">
      <h2 className="thoughts-empty__title fx-crt-title">DEAD AIR</h2>
      <p className="thoughts-empty__copy">
        no notes or essays on that frequency. widen the tuner and try again.
      </p>
      <ActionButton onClick={onReset}>[ reset tuner ]</ActionButton>
    </div>
  )
}
