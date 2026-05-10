import { Link, useLoaderData, useLocation, useSearchParams } from 'react-router-dom'
import { getAdminPhotoOriginalUrl } from '../../../../entities/photo'
import { ActionButton, InlineLabel, ScreenFrame, Stack } from '../../../../shared/ui'
import type { AdminPhotosLoaderData } from '../model/types'

const formatBytes = (value: number | null) => {
  if (!value) {
    return 'size pending'
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function AdminPhotosGalleryPage() {
  const data = useLoaderData() as AdminPhotosLoaderData
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const updateQuery = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === 'all') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }

    next.set('page', '1')
    setSearchParams(next)
  }

  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams)
    if (page <= 1) {
      next.delete('page')
    } else {
      next.set('page', String(page))
    }
    setSearchParams(next)
  }

  return (
    <Stack className="admin-photo-gallery" gap={16}>
      <div className="admin-photo-gallery__header">
        <div>
          <InlineLabel className="admin-photo-gallery__eyebrow">// photo catalog</InlineLabel>
          <h2 className="admin-photo-gallery__title">private gallery</h2>
          <p className="admin-photo-gallery__subtitle">
            Browse drafts and published originals before opening a frame for curation.
          </p>
        </div>
        <ActionButton className="admin-photo-gallery__upload glitch-hover" to="/admin/photos/upload">
          <span aria-hidden="true">►</span>
          upload photo
        </ActionButton>
      </div>

      <ScreenFrame className="admin-panel admin-photo-gallery__filters">
        <InlineLabel className="admin-photo-gallery__panel-label">// filters</InlineLabel>
        <div className="admin-photo-gallery__filters-row">
          <div className="admin-photo-gallery__filter-field">
            <label htmlFor="admin-photo-search">search</label>
            <div className="admin-photo-gallery__input-wrap">
              <span aria-hidden="true" className="admin-photo-gallery__input-prompt">
                &gt;
              </span>
              <input
                id="admin-photo-search"
                value={data.filters.search}
                onChange={(event) => updateQuery({ search: event.target.value })}
                placeholder="title, frame, location"
              />
            </div>
          </div>
          <div className="admin-photo-gallery__filter-field">
            <label htmlFor="admin-photo-status">status</label>
            <div className="admin-photo-gallery__select-wrap">
              <select
                id="admin-photo-status"
                value={data.filters.status}
                onChange={(event) => updateQuery({ status: event.target.value })}
              >
                <option value="all">all</option>
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </div>
          </div>
          <div className="admin-photo-gallery__filter-field">
            <label htmlFor="admin-photo-featured">featured</label>
            <div className="admin-photo-gallery__select-wrap">
              <select
                id="admin-photo-featured"
                value={data.filters.featured}
                onChange={(event) => updateQuery({ featured: event.target.value })}
              >
                <option value="all">all</option>
                <option value="featured">featured</option>
                <option value="not_featured">not featured</option>
              </select>
            </div>
          </div>
        </div>
      </ScreenFrame>

      <ScreenFrame className="admin-panel admin-photo-gallery__records">
        <div className="admin-photo-gallery__records-header">
          <InlineLabel className="admin-photo-gallery__panel-label">// records</InlineLabel>
          <span className="admin-photo-gallery__records-count">
            <span>
              page {data.pageInfo.page} / {data.pageInfo.totalPages}
            </span>{' '}
            // <span>{data.pageInfo.totalItems}</span> total
          </span>
        </div>

        {data.items.length > 0 ? (
          <div className="admin-photo-grid">
            {data.items.map((photo) => (
              <Link
                key={photo.id}
                className="admin-photo-card"
                to={`/admin/photos/${encodeURIComponent(photo.id)}`}
                state={{ from: `${location.pathname}${location.search}` }}
              >
                <span className="admin-photo-card__image">
                  <img src={getAdminPhotoOriginalUrl(photo.id)} alt={photo.title} loading="lazy" />
                </span>
                <span className="admin-photo-card__body">
                  <strong>{photo.title}</strong>
                  <span>
                    {photo.frame} // {photo.location}
                  </span>
                  <span>
                    {photo.status} // {photo.featured ? 'featured' : 'not featured'}
                  </span>
                  <span>{formatBytes(photo.original.byteSize)}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="admin-photo-empty">
            <span className="admin-photo-empty__glyph" aria-hidden="true">
              ░
            </span>
            <strong>no records match filters</strong>
            <span>Adjust the filters or upload a new draft.</span>
          </div>
        )}

        <nav className="admin-photo-pagination" aria-label="Admin photos pagination">
          <button type="button" disabled={data.pageInfo.page <= 1} onClick={() => goToPage(data.pageInfo.page - 1)}>
            ← previous
          </button>
          <span aria-live="polite">
            page {data.pageInfo.page} / {data.pageInfo.totalPages}
          </span>
          <button
            type="button"
            disabled={data.pageInfo.page >= data.pageInfo.totalPages}
            onClick={() => goToPage(data.pageInfo.page + 1)}
          >
            next →
          </button>
        </nav>
      </ScreenFrame>
    </Stack>
  )
}
