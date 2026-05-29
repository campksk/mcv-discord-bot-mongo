import env from '../env/env'
import { targetYear, targetSemester } from '../config/config'
import db, { Course } from '../database/database'
import fetchAndCatch from '../utils/fetchAndCatch'
import {
  ParsedGetCoursesResponse,
  getCoursesResponseSchema,
} from '@/interfaces/GetCoursesResponse'
import { throwErrorToAdmin } from '@/utils/throwErrorToAdmin'

/**
 * Fetch courses from MCV API.
 *
 * ถ้า AUTO_DETERMINE_YEAR_AND_SEMESTER=true → ส่ง yearsem="" ก่อน
 * แล้วอ่าน year/semester จาก course แรกที่ได้กลับมา (แทนการ parse HTML หน้าแรก
 * ซึ่งเป็นหน้า login และไม่มี #student-yearsem-select)
 *
 * @throws {InvalidCookieError}
 */
export default async function updateCourses(): Promise<void> {
  // ── ขั้นตอนที่ 1: ดึง course list ──────────────────────────────────────────
  // ถ้ายังไม่รู้ semester ให้ส่ง yearsem="" เพื่อให้ MCV ส่งกลับมาทุก semester
  // แล้วค่อยอ่านค่าจาก response
  const useAuto =
    env.AUTO_DETERMINE_YEAR_AND_SEMESTER &&
    (targetYear.value === undefined || targetSemester.value === undefined)

  const yearsem =
    useAuto ? '' : `${targetYear.value}/${targetSemester.value}`

  console.log(
    `[updateCourses] Fetching courses (yearsem="${yearsem}", auto=${env.AUTO_DETERMINE_YEAR_AND_SEMESTER})`
  )

  const body = new FormData()
  body.append('yearsem', yearsem)
  body.append('role', 'student')
  body.append('type', 'course')

  const result = await fetchAndCatch(
    `https://www.mycourseville.com/courseville/ajax/cvhomepanel_get_filter`,
    'POST',
    body
  )

  if (result == undefined) {
    console.error('[updateCourses] No response from course list API — cookie may be invalid')
    return
  }

  let resultObj: unknown
  try {
    resultObj = await result.json()
  } catch (e) {
    console.error('[updateCourses] Failed to parse JSON response:', e)
    return
  }

  console.log(
    '[updateCourses] Raw response (truncated):',
    JSON.stringify(resultObj).slice(0, 400)
  )

  // ── ขั้นตอนที่ 2: validate schema ──────────────────────────────────────────
  let response: ParsedGetCoursesResponse
  try {
    response = getCoursesResponseSchema.parse(resultObj)
  } catch (err) {
    console.error('[updateCourses] Schema validation failed:', err)
    console.error('[updateCourses] Full raw response:', JSON.stringify(resultObj).slice(0, 2000))
    if (err instanceof Object && 'stack' in err) {
      await throwErrorToAdmin(
        `[updateCourses] Schema error: ` + (err as Error).stack
      )
    }
    return
  }

  if (response.data.length === 0) {
    console.warn('[updateCourses] API returned 0 courses — cookie may be invalid or no courses this semester')
    return
  }

  console.log(`[updateCourses] Got ${response.data.length} course(s) from API`)

  // ── ขั้นตอนที่ 3: อ่าน year/semester จาก course แรก (ถ้า auto) ────────────
  if (env.AUTO_DETERMINE_YEAR_AND_SEMESTER) {
    // เรียงตาม year/semester ล่าสุดก่อน เพื่อให้ได้ semester ปัจจุบัน
    const sorted = [...response.data].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return b.semester - a.semester
    })
    const latest = sorted[0]
    if (
      targetYear.value !== latest.year ||
      targetSemester.value !== latest.semester
    ) {
      console.log(
        `[updateCourses] Semester detected from API: ${latest.year}/${latest.semester}`
      )
    }
    targetYear.value = latest.year
    targetSemester.value = latest.semester
  }

  // ── ขั้นตอนที่ 4: กรอง เฉพาะ semester ปัจจุบัน แล้ว save ─────────────────
  const currentSemesterCourses = response.data.filter(
    (c) => c.year === targetYear.value && c.semester === targetSemester.value
  )

  console.log(
    `[updateCourses] Saving courses for ${targetYear.value}/${targetSemester.value} (${currentSemesterCourses.length} courses)`
  )

  await Promise.all(
    currentSemesterCourses.map(async (course) => {
      const dbCourse: Course = {
        year: course.year,
        semester: course.semester,
        courseID: course.course_no,
        mcvID: course.cv_cid,
        title: course.title,
      }
      const found = await db.courseExists(dbCourse)
      if (!found) {
        console.log(`[updateCourses] + New course: "${dbCourse.title}" (mcvID=${dbCourse.mcvID})`)
        await db.saveCourse(dbCourse)
      }
    })
  )

  console.log('[updateCourses] Done')
}
