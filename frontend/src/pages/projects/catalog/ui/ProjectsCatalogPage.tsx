import { useDeferredValue, useState } from 'react'
import { allProjectTags, filterProjects, projectFixtures } from '../../../../entities/project'
import { ProjectsControls, defaultProjectsFilterState } from '../../../../features/filter-projects'
import { PageBanner } from '../../../../widgets/page-banner'
import { Container, Section } from '../../../../shared/ui'
import { ProjectCard } from './ProjectCard'
import { ProjectsEmptyState } from './ProjectsEmptyState'

export function ProjectsCatalogPage() {
  const [filters, setFilters] = useState(defaultProjectsFilterState)
  const deferredQuery = useDeferredValue(filters.query)
  const effectiveFilters = { ...filters, query: deferredQuery }
  const projects = projectFixtures
  const tags = allProjectTags(projects)
  const filteredProjects = filterProjects(projects, effectiveFilters)

  return (
    <>
      <PageBanner
        label="projects"
        title="projects. // ch.04"
        description={`${filteredProjects.length} entries on the air: live, rec, and archived transmissions. Browse by channel, filter by signal.`}
      />
      <Section>
        <Container>
          <ProjectsControls
            state={filters}
            onChange={setFilters}
            tags={tags}
            count={filteredProjects.length}
            total={projects.length}
          />
          {filteredProjects.length > 0 ? (
            <div className="projects-grid">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <ProjectsEmptyState onReset={() => setFilters(defaultProjectsFilterState)} />
          )}
        </Container>
      </Section>
    </>
  )
}
