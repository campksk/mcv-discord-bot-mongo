import env from '../env/env'
import { targetYear, targetSemester } from '../config/config'
import db, { Course } from '../database/database'
import fetchAndCatch from '../utils/fetchAndCatch'
import { determineYearAndSemester } from './determineYearAndSemester'
import responseToCheerio from '../utils/responseToCheerio'
import {
  ParsedGetCoursesResponse,
  getCoursesResponseSchema,
} from '@/interfaces/GetCoursesResponse'
import { throwErrorToAdmin } from '@/utils/throwErrorToAdmin'

/**
 * @throws {InvalidCookieError}
 */
export default async function updateCourses(): Promise<void> {
  async function sendToDb(
    course: ParsedGetCoursesResponse['data'][number]
  ): Promise<void> {
    const dbCourse: Course = {
      year: course.year,
      semester: course.semester,
      courseID: course.course_no,
      mcvID: course.cv_cid,
      title: course.title,
    }
    const found = await db.courseExists(dbCourse)
    if (!found) {
      console.log(`[updateCourses] Saving new course: ${dbCourse.title} (mcvID=${dbCourse.mcvID})`)
      await db.saveCourse(dbCourse)
    } else {
      console.log(`[updateCourses] Course already exists: ${dbCourse.title}`)
    }
  }

  if (env.AUTO_DETERMINE_YEAR_AND_SEMESTER) {
    console.log('[updateCourses] Fetching MCV homepage to determine semester...')
    const result = await fetchAndCatch(`https://www.mycourseville.com/`, 'GET')

    if (result == undefined) {
      console.error('[updateCourses] fetchAndCatch returned undefined for homepage — cookie may be invalid or network error')
      return
    }

    console.log(`[updateCourses] Homepage response status: ${result.status}`)
    const $ = await responseToCheerio(result)

    if ($ == undefined) {
      console.error('[updateCourses] responseToCheerio returned undefined — cookie is likely invalid (login page detected)')
      return
    }

    const ok = await determineYearAndSemester($)
    console.log(`[updateCourses] determineYearAndSemester result: ${ok}, year=${targetYear.value}, semester=${targetSemester.value}`)

    if (targetYear.value === undefined || targetSemester.value === undefined) {
      console.warn('[updateCourses] year/semester still unknown after determination — skipping this cycle')
      return
    }
  } else {
    console.log(`[updateCourses] Using fixed semester: ${targetYear.value}/${targetSemester.value}`)
  }

  console.log(`[updateCourses] Fetching course list for ${targetYear.value}/${targetSemester.value}...`)

  const body = new FormData()
  body.append('yearsem', `${targetYear.value}/${targetSemester.value}`)
  body.append('role', 'student')
  body.append('type', 'course')

  const result = await fetchAndCatch(
    `https://www.mycourseville.com/courseville/ajax/cvhomepanel_get_filter`,
    'POST',
    body
  )

  if (result == undefined) {
    console.error('[updateCourses] fetchAndCatch returned undefined for course list')
    return
  }

  let resultObj: unknown
  try {
    resultObj = await result.json()
  } catch (e) {
    console.error('[updateCourses] Failed to parse course list response as JSON:', e)
    return
  }

  console.log('[updateCourses] Raw course list response:', JSON.stringify(resultObj).slice(0, 300))

  if (resultObj == null) {
    console.warn('[updateCourses] Course list response is null')
    return
  }

  try {
    const response = getCoursesResponseSchema.parse(resultObj)
    console.log(`[updateCourses] Found ${response.data.length} course(s) from API`)
    await Promise.all(response.data.map((c) => sendToDb(c)))
    console.log('[updateCourses] Done saving courses')
  } catch (err) {
    console.error('[updateCourses] Zod schema validation failed:', err)
    console.error('[updateCourses] Raw response was:', JSON.stringify(resultObj).slice(0, 1000))
    if (err instanceof Object && 'stack' in err) {
      await throwErrorToAdmin(
        `[updateCourses] error while validating response: ` + (err as Error).stack
      )
    }
  }
}
