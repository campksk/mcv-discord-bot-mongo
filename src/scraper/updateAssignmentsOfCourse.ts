import { Assignment } from '../database/database'
import fetchAndCatch from '../utils/fetchAndCatch'
import responseToCheerio from '../utils/responseToCheerio'
import extractAssignmentsFromCheerio from './extractAssignmentsFromCheerio'
import scrapeAssignmentsOfPage from './scrapeAssignmentsOfPage'

/**
 * @throws {InvalidCookieError}
 */
export default async function updateAssignmentsOfCourse(
  mcvID: number
): Promise<Map<number, Assignment[]> | undefined> {
  const result = await fetchAndCatch(
    `https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`,
    'GET'
  )
  const $ = await responseToCheerio(result)
  if ($ == undefined) return undefined

  const mergedNewAssignments: Map<number, Assignment[]> = new Map()

  const foundCourseIdAndAssignments = await extractAssignmentsFromCheerio($)
  if (foundCourseIdAndAssignments == undefined) return undefined

  const [foundMcvId, assignments] = foundCourseIdAndAssignments
  if (assignments.length !== 0) {
    mergedNewAssignments.set(foundMcvId, assignments)
  }

  let hasNext = true
  for (let currentItems = 5; hasNext; currentItems += 5) {
    const scrapeResult = await scrapeAssignmentsOfPage(currentItems)
    if (scrapeResult == undefined) break

    const [resultHasNext, resultMcvId, resultAssignments] = scrapeResult
    hasNext = resultHasNext

    if (resultAssignments.length === 0) continue

    if (!mergedNewAssignments.has(resultMcvId)) {
      mergedNewAssignments.set(resultMcvId, resultAssignments)
    } else {
      const existing = mergedNewAssignments.get(resultMcvId)!
      resultAssignments.forEach((a) => existing.push(a))
    }
  }

  return mergedNewAssignments
}
