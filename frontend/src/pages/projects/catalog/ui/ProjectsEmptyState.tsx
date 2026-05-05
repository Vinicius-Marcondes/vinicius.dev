import { ActionButton } from '../../../../shared/ui'

type ProjectsEmptyStateProps = {
  onReset: () => void
}

export function ProjectsEmptyState({ onReset }: ProjectsEmptyStateProps) {
  return (
    <div className="projects-empty">
      <h2 className="projects-empty__title fx-crt-title">NO SIGNAL</h2>
      <p className="projects-empty__copy">
        nothing is broadcasting on that combination. try a wider filter or a different channel.
      </p>
      <ActionButton onClick={onReset}>[ reset filters ]</ActionButton>
    </div>
  )
}
