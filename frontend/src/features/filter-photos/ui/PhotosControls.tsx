import type { ChangeEvent } from 'react'
import type { PhotosFilterState } from '../model/types'

type PhotosControlsProps = {
  count: number
  locations: string[]
  onChange: (nextState: PhotosFilterState) => void
  state: PhotosFilterState
  total: number
  years: string[]
}

export function PhotosControls({
  count,
  locations,
  onChange,
  state,
  total,
  years,
}: PhotosControlsProps) {
  const patchState = (patch: Partial<PhotosFilterState>) => {
    onChange({ ...state, ...patch })
  }

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    patchState({ query: event.target.value })
  }

  return (
    <form className="photos-controls" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="photos-controls__search">
        <span className="photos-controls__label">&gt; find</span>
        <input
          className="photos-controls__input"
          type="search"
          value={state.query}
          onChange={handleQueryChange}
          placeholder="title, location, tag..."
        />
        <span className="photos-controls__count">
          {count} / {total}
        </span>
      </label>
      <div className="photos-controls__filters">
        <label>
          <span className="sr-only">Filter by location</span>
          <select
            className="photos-controls__select"
            value={state.location}
            onChange={(event) => patchState({ location: event.target.value })}
          >
            <option value="all">// all locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by year</span>
          <select
            className="photos-controls__select"
            value={state.year}
            onChange={(event) => patchState({ year: event.target.value })}
          >
            <option value="all">// all years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
    </form>
  )
}
