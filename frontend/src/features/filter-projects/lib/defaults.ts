import type { ProjectsFilterState } from '../model/types'

export const defaultProjectsFilterState: ProjectsFilterState = {
  query: '',
  status: 'all',
  tag: 'all',
  sort: 'recent',
}
