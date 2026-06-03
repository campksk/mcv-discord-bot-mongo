import {
  CourseModel,
  AssignmentModel,
  NotificationChannelModel,
} from './models'
import { assignmentsCache, coursesCache } from './cache'

// ── Plain object types ────────────────────────────────────────────────────────
export interface Course {
  mcvID: number
  courseID: string
  title: string
  year: number
  semester: number
}

export interface Assignment {
  mcvCourseID: number
  assignmentName: string
  assignmentID: number
}

export interface NotificationChannel {
  guildID: string
  channelID: string
}

// ── Index keys ────────────────────────────────────────────────────────────────
function indexAssignment(a: Assignment): string {
  return `${a.mcvCourseID}/${a.assignmentID}`
}

function indexCourse(c: Course): string {
  return c.mcvID.toString()
}

// ── DB namespace ──────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace db {
  export async function courseExists(course: Course): Promise<boolean> {
    if (coursesCache.get(indexCourse(course)) !== undefined) return true
    const found = await CourseModel.findOne({ mcvID: course.mcvID }).lean()
    if (found) coursesCache.set(indexCourse(course), course)
    return found != null
  }

  export async function assignmentExists(assignment: Assignment): Promise<boolean> {
    if (assignmentsCache.get(indexAssignment(assignment)) !== undefined) return true
    const found = await AssignmentModel.findOne({
      mcvCourseID: assignment.mcvCourseID,
      assignmentID: assignment.assignmentID,
    }).lean()
    if (found) assignmentsCache.set(indexAssignment(assignment), assignment)
    return found != null
  }

  export async function channelOfGuildExists(channel: NotificationChannel): Promise<boolean> {
    const found = await NotificationChannelModel.findOne({ guildID: channel.guildID }).lean()
    return found != null
  }

  export async function getAllChannels(): Promise<NotificationChannel[]> {
    const docs = await NotificationChannelModel.find().lean()
    return docs.map((d) => ({ guildID: d.guildID, channelID: d.channelID }))
  }

  /** ดึงทุก course จาก DB (ทุก semester) */
  export async function getAllCourses(): Promise<Course[]> {
    const docs = await CourseModel.find().lean()
    return docs.map(docToCourse)
  }

  export async function getCourse(mcvID: number): Promise<Course | null> {
    const cached = coursesCache.get(mcvID.toString())
    if (cached !== undefined) return cached
    const doc = await CourseModel.findOne({ mcvID }).lean()
    return doc ? docToCourse(doc) : null
  }

  export async function getChannelOfGuild(guildID: string): Promise<NotificationChannel | null> {
    const doc = await NotificationChannelModel.findOne({ guildID }).lean()
    return doc ? { guildID: doc.guildID, channelID: doc.channelID } : null
  }

  export async function saveCourse(course: Course): Promise<void> {
    await CourseModel.create(course)
    coursesCache.set(indexCourse(course), course)
  }

  export async function saveAssignment(assignment: Assignment): Promise<void> {
    await AssignmentModel.create(assignment)
    assignmentsCache.set(indexAssignment(assignment), assignment)
  }

  export async function saveChannel(channel: NotificationChannel): Promise<void> {
    await NotificationChannelModel.create(channel)
  }

  export async function unsetChannelOfGuild(guildID: string): Promise<void> {
    const result = await NotificationChannelModel.deleteOne({ guildID })
    if (result.deletedCount === 0) {
      throw new Error(`No notification channel found for guild ${guildID}`)
    }
  }
}

export default db

function docToCourse(doc: {
  mcvID: number
  courseID: string
  title: string
  year: number
  semester: number
}): Course {
  return {
    mcvID: doc.mcvID,
    courseID: doc.courseID,
    title: doc.title,
    year: doc.year,
    semester: doc.semester,
  }
}
