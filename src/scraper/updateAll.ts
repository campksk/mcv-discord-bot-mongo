import {
  ASSIGNMENT_MESSAGE_PATTERN,
  COURSE_MESSAGE_PATTERN,
  MAX_DISCORD_MESSAGE_SIZE,
  NEW_ASSIGNMENTS_MESSAGE,
  NEW_ASSIGNMENTS_MESSAGE_SIZE,
} from '@/config/config'
import db, { Assignment, Course } from '../database/database'
import updateAssignmentsOfCourse from './updateAssignmentsOfCourse'
import updateCourses from './updateCourses'
import MutableWrapper from '@/utils/MutableWrapper'
import { format } from 'util'

/**
 * @description update assignments of each course
 * @returns messages containing new assignments (ready to send to Discord)
 * @throws {Error}
 */
export async function updateAll(): Promise<string[]> {
  await updateCourses()
  const coursesList = await db.getAllCoursesOfTargetSemester()

  const mcvIdToCourse: Map<number, Course> = new Map()
  for (const course of coursesList) {
    mcvIdToCourse.set(course.mcvID, course)
  }

  const mcvIdToNewAssignments: Map<number, Assignment[]> = new Map()
  for (const course of coursesList) {
    const newAssignments = await updateAssignmentsOfCourse(course.mcvID)
    if (newAssignments == undefined || newAssignments.size === 0) continue

    for (const [mcvId, assignments] of newAssignments) {
      if (assignments.length === 0) continue
      if (!mcvIdToNewAssignments.has(mcvId)) {
        mcvIdToNewAssignments.set(mcvId, assignments)
      } else {
        mcvIdToNewAssignments.get(mcvId)!.push(...assignments)
      }
    }
  }

  if (mcvIdToNewAssignments.size === 0) return []

  const messages: string[] = []
  const currentMessage = new MutableWrapper(NEW_ASSIGNMENTS_MESSAGE)
  const currentMessageSize = new MutableWrapper(NEW_ASSIGNMENTS_MESSAGE_SIZE)

  for (const [mcvId, assignments] of mcvIdToNewAssignments.entries()) {
    const courseInformation = mcvIdToCourse.get(mcvId)!
    const newCourseLine = format(COURSE_MESSAGE_PATTERN, courseInformation.title)

    if (
      currentMessageSize.value + [...newCourseLine].length >
      MAX_DISCORD_MESSAGE_SIZE
    ) {
      pushAndReinitialize(messages, currentMessage, currentMessageSize)
    }

    for (const assignment of assignments) {
      const newAssignmentLine = format(
        ASSIGNMENT_MESSAGE_PATTERN,
        assignment.assignmentName === '' ? '(Nameless)' : assignment.assignmentName,
        mcvId,
        assignment.assignmentID
      )
      const newAssignmentLineSize = [...newAssignmentLine].length
      const isFirstAssignment = assignments[0] === assignment

      if (
        currentMessageSize.value + newAssignmentLineSize >
        MAX_DISCORD_MESSAGE_SIZE
      ) {
        pushAndReinitialize(messages, currentMessage, currentMessageSize)
        currentMessage.value += newCourseLine
        currentMessageSize.value += [...newCourseLine].length
      } else if (isFirstAssignment) {
        currentMessage.value += newCourseLine
        currentMessageSize.value += [...newCourseLine].length
      }

      currentMessage.value += newAssignmentLine
      currentMessageSize.value += newAssignmentLineSize
    }
  }

  messages.push(currentMessage.value)
  return messages
}

function pushAndReinitialize(
  messages: string[],
  currentMessage: MutableWrapper<string>,
  currentMessageSize: MutableWrapper<number>
) {
  messages.push(currentMessage.value)
  currentMessage.value = NEW_ASSIGNMENTS_MESSAGE
  currentMessageSize.value = NEW_ASSIGNMENTS_MESSAGE_SIZE
}
