import type { ChangeEvent } from 'react'
import type { ProjectStatus } from '../../../entities/project'
import { cx } from '../../../shared/lib'
import type { ProjectsFilterState, ProjectsSortMode } from '../model/types'

type ProjectsControlsProps = {
  count: number
  onChange: (nextState: ProjectsFilterState) => void
  state: ProjectsFilterState
  tags: string[]
  total: number
}

type SegmentOption<T extends string> = {
  label: string
  value: T
}

const statusOptions: Array<SegmentOption<ProjectsFilterState['status']>> = [
  { label: 'all', value: 'all' },
  { label: 'live', value: 'live' },
  { label: 'rec', value: 'in-progress' },
  { label: 'archived', value: 'archived' },
]

const sortOptions: Array<SegmentOption<ProjectsSortMode>> = [
  { label: 'recent', value: 'recent' },
  { label: 'a-z', value: 'alpha' },
  { label: 'ch.##', value: 'channel' },
]

function Segment<T extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: T) => void
  options: Array<SegmentOption<T>>
  value: T
}) {
  return (
    <div className="projects-controls__segment">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cx('projects-controls__segment-button', option.value === value && 'is-active')}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function ProjectsControls({ count, onChange, state, tags, total }: ProjectsControlsProps) {
  const patchState = (patch: Partial<ProjectsFilterState>) => {
    onChange({ ...state, ...patch })
  }

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    patchState({ query: event.target.value })
  }

  const handleTagChange = (event: ChangeEvent<HTMLSelectElement>) => {
    patchState({ tag: event.target.value })
  }

  return (
    <form className="projects-controls" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="projects-controls__search">
        <span className="projects-controls__label">&gt; find</span>
        <input
          className="projects-controls__input"
          type="search"
          value={state.query}
          onChange={handleQueryChange}
          placeholder="title, tag, channel..."
        />
        <span className="projects-controls__count">
          {count} / {total}
        </span>
      </label>
      <div className="projects-controls__filters">
        <Segment<ProjectStatus | 'all'>
          value={state.status}
          options={statusOptions}
          onChange={(status) => patchState({ status })}
        />
        <Segment<ProjectsSortMode>
          value={state.sort}
          options={sortOptions}
          onChange={(sort) => patchState({ sort })}
        />
        <label className="projects-controls__select-label">
          <span className="sr-only">Filter by tag</span>
          <select className="projects-controls__select" value={state.tag} onChange={handleTagChange}>
            <option value="all">// all tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
      </div>
    </form>
  )
}
