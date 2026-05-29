import { CheerioAPI } from 'cheerio'
import db, { Assignment } from '../database/database'

export default async function extractAssignmentsFromCheerio(
  $: CheerioAPI
): Promise<[number, Assignment[]] | undefined> {
  const assignmentNameNodes = $('tbody tr td:nth-child(2) a').toArray()
  const assignments: Assignment[] = []
  let foundMcvId: number | undefined = undefined

  for (const ele of assignmentNameNodes) {
    const assignmentLink = $(ele).attr('href')
    const mcvIdAndAssignment = assignmentLink!.match(/^.*\/(\d+)\/(\d+)$/)!

    const currentMcvId: number = parseInt(mcvIdAndAssignment[1])
    if (foundMcvId == undefined) {
      foundMcvId = currentMcvId
    } else if (currentMcvId !== foundMcvId) {
      throw new Error('Unexpected course id')
    }

    const assignmentId: number = parseInt(mcvIdAndAssignment[2], 10)
    const assignment: Assignment = {
      mcvCourseID: foundMcvId,
      assignmentName: $(ele).text(),
      assignmentID: assignmentId,
    }

    const found = await db.assignmentExists(assignment)
    if (!found) {
      console.log('found new assignment', assignment)
      assignments.push(assignment)
      await db.saveAssignment(assignment)
    }
  }

  if (foundMcvId == undefined) return undefined
  return [foundMcvId, assignments]
}
