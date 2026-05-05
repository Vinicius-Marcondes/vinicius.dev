import type { ThoughtType } from '../../../entities/thought'

export type ThoughtsFilterState = {
  query: string
  tag: string
  type: 'all' | ThoughtType
}
