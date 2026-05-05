import { useDeferredValue, useState } from 'react'
import {
  allPhotoLocations,
  allPhotoYears,
  filterPhotos,
  groupPhotosByMonth,
  photoCamera,
  photoFixtures,
} from '../../../../entities/photo'
import { PhotosControls, defaultPhotosFilterState } from '../../../../features/filter-photos'
import { PageBanner } from '../../../../widgets/page-banner'
import { Container, Section } from '../../../../shared/ui'
import { PhotoCard } from './PhotoCard'
import { PhotoLightbox } from './PhotoLightbox'
import { PhotosEmptyState } from './PhotosEmptyState'

export function PhotosGalleryPage() {
  const [filters, setFilters] = useState(defaultPhotosFilterState)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const deferredQuery = useDeferredValue(filters.query)
  const photos = photoFixtures
  const filteredPhotos = filterPhotos(photos, { ...filters, query: deferredQuery })
  const monthGroups = groupPhotosByMonth(filteredPhotos)

  const navigateLightbox = (direction: -1 | 1) => {
    setSelectedIndex((current) => {
      if (current === null || filteredPhotos.length === 0) return current
      return (current + direction + filteredPhotos.length) % filteredPhotos.length
    })
  }

  return (
    <div className="photos-page" data-theme="safelight">
      <PageBanner
        label="photos"
        title="photos. // ch.05"
        description={`${photos.length} frames, one camera (${photoCamera}), several cities. Click any frame to enlarge; use left/right arrows to navigate.`}
      />
      <Section>
        <Container>
          <PhotosControls
            state={filters}
            onChange={setFilters}
            years={allPhotoYears(photos)}
            locations={allPhotoLocations(photos)}
            count={filteredPhotos.length}
            total={photos.length}
          />
          {monthGroups.length > 0 ? (
            <div className="photos-contact-sheet">
              {monthGroups.map((group) => (
                <section key={group.month} className="photos-month">
                  <h2 className="photos-month__title">{group.month}</h2>
                  <div className="photos-grid">
                    {group.items.map((photo) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onOpen={() => setSelectedIndex(filteredPhotos.findIndex((item) => item.id === photo.id))}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <PhotosEmptyState onReset={() => setFilters(defaultPhotosFilterState)} />
          )}
        </Container>
      </Section>
      <PhotoLightbox
        open={selectedIndex !== null}
        photos={filteredPhotos}
        index={selectedIndex ?? 0}
        onClose={() => setSelectedIndex(null)}
        onNavigate={navigateLightbox}
      />
    </div>
  )
}
