import fetchAndCatch from '../utils/fetchAndCatch'
import { Assignment } from '../database/database'
import * as cheerio from 'cheerio'
import LoadMoreAssignmentsResponse from '../interfaces/LoadMoreAssignmentsResponse'
import extractAssignmentsFromCheerio from './extractAssignmentsFromCheerio'

/**
 * @throws {InvalidCookieError}
 */
export default async function scrapeAssignmentsOfPage(
  next: number
): Promise<[boolean, number, Assignment[]] | undefined> {
  const response = await fetchAndCatch(
    `https://www.mycourseville.com/?q=courseville/ajax/loadmoreassignmentrows`,
    'POST',
    new URLSearchParams({ next: next.toString() })
  )
  if (response == undefined) return undefined

  const resultJson: LoadMoreAssignmentsResponse = await response.json()
  if (resultJson.status === 0) return undefined

  const $ = cheerio.load(
    '<html><table><tbody>' + resultJson.data.html + '</tbody></table></html>'
  )

  const courseAndAssignment = await extractAssignmentsFromCheerio($)
  if (courseAndAssignment == undefined) return undefined

  const [courseId, assignments] = courseAndAssignment
  const hasNext = resultJson.all == undefined || resultJson.all !== true
  return [hasNext, courseId, assignments]
}
