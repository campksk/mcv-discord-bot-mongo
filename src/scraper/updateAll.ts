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

// นำเข้าฟังก์ชันรีเฟรชตาราง
import { refreshAssignmentsActive } from '../utils/refreshAssignmentsActive'

// เอา client ออกจาก parameter
export async function updateAll(): Promise<string[]> {
  await updateCourses()
  const coursesList = await db.getAllCourses()

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

  // --- รีเฟรชตารางตรงนี้ โดยไม่ต้องพึ่งพา parameter client ---
  console.log('[updateAll] Refreshing assignments active dashboard...')
  await refreshAssignmentsActive().catch(e => 
    console.error('[updateAll] Error refreshing dashboard:', e)
  )
  // ----------------------------------------------------

  if (mcvIdToNewAssignments.size === 0) return []

  const messages: string[] = []
  const currentMessage = new MutableWrapper(NEW_ASSIGNMENTS_MESSAGE)
  const currentMessageSize = new MutableWrapper(NEW_ASSIGNMENTS_MESSAGE_SIZE)

  for (const [mcvId, assignments] of mcvIdToNewAssignments.entries()) {
    const course = mcvIdToCourse.get(mcvId)!
    const newCourseLine = format(
      COURSE_MESSAGE_PATTERN,
      course.title,
      course.year,
      course.semester
    )

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