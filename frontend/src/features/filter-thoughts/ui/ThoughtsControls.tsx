import type { ChangeEvent } from 'react'
import { cx } from '../../../shared/lib'
import type { ThoughtsFilterState } from '../model/types'

type ThoughtsControlsProps = {
  count: number
  onChange: (nextState: ThoughtsFilterState) => void
  state: ThoughtsFilterState
  tags: string[]
  total: number
}

const typeOptions: Array<{ label: string; value: ThoughtsFilterState['type'] }> = [
  { label: 'all', value: 'all' },
  { label: 'notes', value: 'note' },
  { label: 'essays', value: 'essay' },
]

export function ThoughtsControls({ count, onChange, state, tags, total }: ThoughtsControlsProps) {
  const patchState = (patch: Partial<ThoughtsFilterState>) => {
    onChange({ ...state, ...patch })
  }

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    patchState({ query: event.target.value })
  }

  return (
    <form className="thoughts-controls" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="thoughts-controls__search">
        <span className="thoughts-controls__label">&gt; tune</span>
        <input
          className="thoughts-controls__input"
          type="search"
          value={state.query}
          onChange={handleQueryChange}
          placeholder="title, tag, stray signal..."
        />
        <span className="thoughts-controls__count">
          {count} / {total}
        </span>
      </label>
      <div className="thoughts-controls__filters">
        <div className="thoughts-controls__segment">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cx('thoughts-controls__segment-button', state.type === option.value && 'is-active')}
              onClick={() => patchState({ type: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label>
          <span className="sr-only">Filter thoughts by tag</span>
          <select
            className="thoughts-controls__select"
            value={state.tag}
            onChange={(event) => patchState({ tag: event.target.value })}
          >
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
