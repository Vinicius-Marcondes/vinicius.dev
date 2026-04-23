import type { ThoughtRecord } from '../../../../entities/thought'

type ThoughtCardProps = {
  thought: ThoughtRecord
}

export function ThoughtCard({ thought }: ThoughtCardProps) {
  return (
    <article className="thought-card">
      <div className="thought-card__rail" aria-hidden="true">
        <span>{thought.type === 'essay' ? 'LONG PLAY' : 'SHORT WAVE'}</span>
      </div>
      <div className="thought-card__body">
        <div className="thought-card__meta">
          <span>{thought.type}</span>
          <span>{thought.publishedAt}</span>
          <span>{thought.readingTime}</span>
        </div>
        <h2 className="thought-card__title">{thought.title}</h2>
        <p className="thought-card__excerpt">{thought.excerpt}</p>
        <p className="thought-card__preview">{thought.bodyPreview}</p>
        <div className="thought-card__footer">
          <div className="thought-card__tags">
            {thought.tags.map((tag) => (
              <span key={tag} className="thought-card__tag">
                {tag}
              </span>
            ))}
          </div>
          <span className="thought-card__read-more">read signal // soon</span>
        </div>
      </div>
    </article>
  )
}
