import type { ProjectStatus } from '../../../entities/project'

export type ProjectsSortMode = 'recent' | 'alpha' | 'channel'

export type ProjectsFilterState = {
  query: string
  status: 'all' | ProjectStatus
  tag: string
  sort: ProjectsSortMode
}
