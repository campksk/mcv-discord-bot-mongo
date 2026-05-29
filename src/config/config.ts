import MutableWrapper from '../utils/MutableWrapper'

export const targetYear: MutableWrapper<number | undefined> =
  new MutableWrapper(undefined)
export const targetSemester: MutableWrapper<number | undefined> =
  new MutableWrapper(undefined)

export const MAX_DISCORD_MESSAGE_SIZE = 2000
export const NEW_ASSIGNMENTS_MESSAGE = '## New Assignments!!'
export const NEW_ASSIGNMENTS_MESSAGE_SIZE = [...NEW_ASSIGNMENTS_MESSAGE].length
export const COURSE_MESSAGE_PATTERN = '\n- %s'
export const ASSIGNMENT_MESSAGE_PATTERN =
  '\n  - [%s](https://www.mycourseville.com/?q=courseville/worksheet/%d/%d)'

export enum NotifyMessage {
  FetchingError = 'Error fetching, Might be rate limited or server is down',
  SessionLost = 'Session lost',
}
