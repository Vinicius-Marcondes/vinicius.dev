import { ActionButton } from '../../../../shared/ui'

type PhotosEmptyStateProps = {
  onReset: () => void
}

export function PhotosEmptyState({ onReset }: PhotosEmptyStateProps) {
  return (
    <div className="photos-empty">
      <h2 className="photos-empty__title fx-crt-title">NO FRAMES</h2>
      <p className="photos-empty__copy">
        that contact sheet came back blank. loosen the filters and try the enlarger again.
      </p>
      <ActionButton onClick={onReset}>[ reset filters ]</ActionButton>
    </div>
  )
}
