import db, { Course } from '../database/database'
import fetchAndCatch from '../utils/fetchAndCatch'
import {
  ParsedGetCoursesResponse,
  getCoursesResponseSchema,
} from '@/interfaces/GetCoursesResponse'
import { throwErrorToAdmin } from '@/utils/throwErrorToAdmin'

/**
 * Fetch ALL courses from MCV API (all semesters) and save new ones to DB.
 */
export default async function updateCourses(): Promise<void> {
  console.log('[updateCourses] Fetching all courses...')

  const body = new FormData()
  body.append('yearsem', '')
  body.append('role', 'student')
  body.append('type', 'course')

  const result = await fetchAndCatch(
    `https://www.mycourseville.com/courseville/ajax/cvhomepanel_get_filter`,
    'POST',
    body
  )

  if (result == undefined) {
    console.error('[updateCourses] No response — cookie may be invalid')
    return
  }

  let resultObj: unknown
  try {
    resultObj = await result.json()
  } catch (e) {
    console.error('[updateCourses] Failed to parse JSON:', e)
    return
  }

  let response: ParsedGetCoursesResponse
  try {
    response = getCoursesResponseSchema.parse(resultObj)
  } catch (err) {
    console.error('[updateCourses] Schema validation failed:', err)
    console.error('[updateCourses] Raw:', JSON.stringify(resultObj).slice(0, 2000))
    if (err instanceof Object && 'stack' in err) {
      await throwErrorToAdmin(`[updateCourses] Schema error: ` + (err as Error).stack)
    }
    return
  }

  if (response.data.length === 0) {
    console.warn('[updateCourses] API returned 0 courses — cookie may be invalid')
    return
  }

  console.log(`[updateCourses] Got ${response.data.length} course(s) across all semesters`)

  await Promise.all(
    response.data.map(async (course) => {
      const dbCourse: Course = {
        year: course.year,
        semester: course.semester,
        courseID: course.course_no,
        mcvID: course.cv_cid,
        title: course.title,
      }
      const found = await db.courseExists(dbCourse)
      if (!found) {
        console.log(`[updateCourses] + "${dbCourse.title}" (${dbCourse.year}/${dbCourse.semester}, mcvID=${dbCourse.mcvID})`)
        await db.saveCourse(dbCourse)
      }
    })
  )

  console.log('[updateCourses] Done')
}
