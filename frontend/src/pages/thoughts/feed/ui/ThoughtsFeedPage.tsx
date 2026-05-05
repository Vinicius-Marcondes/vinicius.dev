import { useDeferredValue, useState } from 'react'
import { allThoughtTags, filterThoughts, thoughtFixtures } from '../../../../entities/thought'
import { ThoughtsControls, defaultThoughtsFilterState } from '../../../../features/filter-thoughts'
import { PageBanner } from '../../../../widgets/page-banner'
import { Container, Section } from '../../../../shared/ui'
import { ThoughtCard } from './ThoughtCard'
import { ThoughtsEmptyState } from './ThoughtsEmptyState'

export function ThoughtsFeedPage() {
  const [filters, setFilters] = useState(defaultThoughtsFilterState)
  const deferredQuery = useDeferredValue(filters.query)
  const thoughts = thoughtFixtures
  const publishedThoughts = thoughts.filter((thought) => thought.status === 'published')
  const filteredThoughts = filterThoughts(publishedThoughts, { ...filters, query: deferredQuery })
  const tags = allThoughtTags(publishedThoughts)

  return (
    <>
      <PageBanner
        label="thoughts"
        title="thoughts. // ch.06"
        description="One feed for notes and essays: small transmissions, longer field reports, and the occasional suspiciously organized opinion."
      />
      <Section>
        <Container>
          <ThoughtsControls
            state={filters}
            onChange={setFilters}
            tags={tags}
            count={filteredThoughts.length}
            total={publishedThoughts.length}
          />
          {filteredThoughts.length > 0 ? (
            <div className="thoughts-feed">
              {filteredThoughts.map((thought) => (
                <ThoughtCard key={thought.id} thought={thought} />
              ))}
            </div>
          ) : (
            <ThoughtsEmptyState onReset={() => setFilters(defaultThoughtsFilterState)} />
          )}
        </Container>
      </Section>
    </>
  )
}
