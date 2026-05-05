import type { ProjectRecord, ProjectThumbnailHue } from '../../../../entities/project'
import { cx } from '../../../../shared/lib'

const hueClassName: Record<ProjectThumbnailHue, string> = {
  amber: 'project-thumbnail--amber',
  cyan: 'project-thumbnail--cyan',
  pink: 'project-thumbnail--pink',
}

type ProjectThumbnailProps = {
  project: ProjectRecord
}

export function ProjectThumbnail({ project }: ProjectThumbnailProps) {
  return (
    <div
      className={cx(
        'project-thumbnail',
        `project-thumbnail--${project.thumbnail.kind}`,
        hueClassName[project.thumbnail.hue],
        project.status === 'archived' && 'is-archived',
      )}
    >
      <div className="project-thumbnail__picture" aria-hidden="true" />
      <span className="project-thumbnail__channel">ch.{project.channel}</span>
      {project.status === 'archived' ? <span className="project-thumbnail__stamp">archived</span> : null}
      {project.status === 'in-progress' ? (
        <span className="project-thumbnail__rec">
          <span className="project-thumbnail__rec-dot" aria-hidden="true" />
          rec
        </span>
      ) : null}
    </div>
  )
}
