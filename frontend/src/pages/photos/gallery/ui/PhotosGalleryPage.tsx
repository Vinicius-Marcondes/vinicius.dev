import { useState } from 'react'
import { useLoaderData, useSearchParams } from 'react-router-dom'
import { photoCamera } from '../../../../entities/photo'
import { PhotosControls, defaultPhotosFilterState, type PhotosFilterState } from '../../../../features/filter-photos'
import { PageBanner } from '../../../../widgets/page-banner'
import { Container, Section } from '../../../../shared/ui'
import type { PhotosGalleryLoaderData } from '../route'
import { PhotoCard } from './PhotoCard'
import { PhotoLightbox } from './PhotoLightbox'
import { PhotosEmptyState } from './PhotosEmptyState'

const buildGallerySearchParams = (filters: PhotosFilterState, page: number) => {
  const searchParams = new URLSearchParams()
  const query = filters.query.trim()

  if (page > 1) {
    searchParams.set('page', String(page))
  }

  if (filters.year !== 'all') {
    searchParams.set('year', filters.year)
  }

  if (filters.location !== 'all') {
    searchParams.set('location', filters.location)
  }

  if (query.length > 0) {
    searchParams.set('search', query)
  }

  return searchParams
}

export function PhotosGalleryPage() {
  const { facets, filters, items, pageInfo } = useLoaderData() as PhotosGalleryLoaderData
  const [, setSearchParams] = useSearchParams()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const hasPreviousPage = pageInfo.page > 1
  const hasNextPage = pageInfo.page < pageInfo.totalPages

  const navigateLightbox = (direction: -1 | 1) => {
    setSelectedIndex((current) => {
      if (current === null || items.length === 0) return current
      return (current + direction + items.length) % items.length
    })
  }

  const updateFilters = (nextFilters: PhotosFilterState) => {
    setSelectedIndex(null)
    setSearchParams(buildGallerySearchParams(nextFilters, 1), { preventScrollReset: true })
  }

  const goToPage = (nextPage: number) => {
    setSelectedIndex(null)
    setSearchParams(buildGallerySearchParams(filters, nextPage), { preventScrollReset: true })
  }

  return (
    <div className="photos-page" data-theme="safelight">
      <PageBanner
        label="photos"
        title="photos. // ch.05"
        description={`${pageInfo.totalItems} frames, one camera (${photoCamera}), several cities. Click any frame to enlarge; use left/right arrows to navigate.`}
      />
      <Section>
        <Container>
          <PhotosControls
            state={filters}
            onChange={updateFilters}
            years={facets.years}
            locations={facets.locations}
            count={items.length}
            total={pageInfo.totalItems}
          />
          <nav
            aria-label="Photos pagination"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}
          >
            <button
              type="button"
              className="action-button"
              aria-label="Go to previous photos page"
              disabled={!hasPreviousPage}
              onClick={() => goToPage(pageInfo.page - 1)}
              style={{ minHeight: 36, minWidth: 160 }}
            >
              [ prev page ]
            </button>
            <span aria-live="polite" style={{ minWidth: 140, textAlign: 'center' }}>
              page {pageInfo.page} / {pageInfo.totalPages}
            </span>
            <button
              type="button"
              className="action-button"
              aria-label="Go to next photos page"
              disabled={!hasNextPage}
              onClick={() => goToPage(pageInfo.page + 1)}
              style={{ minHeight: 36, minWidth: 160 }}
            >
              [ next page ]
            </button>
          </nav>
          {items.length > 0 ? (
            <div className="photos-grid photos-grid--public">
              {items.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onOpen={() => setSelectedIndex(index)}
                />
              ))}
            </div>
          ) : (
            <PhotosEmptyState onReset={() => updateFilters(defaultPhotosFilterState)} />
          )}
        </Container>
      </Section>
      <PhotoLightbox
        open={selectedIndex !== null}
        photos={items}
        index={selectedIndex ?? 0}
        onClose={() => setSelectedIndex(null)}
        onNavigate={navigateLightbox}
      />
    </div>
  )
}
