import type { ProjectRecord, ProjectStatus } from '../../../../entities/project'
import { ProjectThumbnail } from './ProjectThumbnail'

const statusMeta: Record<ProjectStatus, { className: string; label: string }> = {
  archived: { className: 'project-card__status--archived', label: 'ARCHIVED' },
  'in-progress': { className: 'project-card__status--recording', label: 'REC' },
  live: { className: 'project-card__status--live', label: 'LIVE' },
}

type ProjectCardProps = {
  project: ProjectRecord
}

export function ProjectCard({ project }: ProjectCardProps) {
  const meta = statusMeta[project.status]

  return (
    <article className="project-card">
      <div className="project-card__marquee">
        <span>ch.{project.channel}</span>
        <span className={meta.className}>● {meta.label}</span>
      </div>
      <ProjectThumbnail project={project} />
      <div className="project-card__body">
        <div className="project-card__title-row">
          <h2 className="project-card__title">{project.title}</h2>
          <span className="project-card__year">{project.year}</span>
        </div>
        <p className="project-card__description">{project.description}</p>
      </div>
      <div className="project-card__tags" aria-label={`${project.title} tags`}>
        {project.tags.map((tag) => (
          <span key={tag} className="project-card__tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="project-card__links">
        {project.links.site ? (
          <a className="project-card__link glitch-hover" href={project.links.site}>
            <span aria-hidden="true">↗</span>
            visit
          </a>
        ) : null}
        {project.links.github ? (
          <a className="project-card__link project-card__link--source glitch-hover" href={project.links.github}>
            <span aria-hidden="true">{'{ }'}</span>
            source
          </a>
        ) : null}
        {!project.links.site && !project.links.github ? (
          <span className="project-card__no-signal">// no signal</span>
        ) : null}
      </div>
    </article>
  )
}
