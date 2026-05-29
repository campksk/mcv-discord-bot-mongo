import { CheerioAPI } from 'cheerio'
import { throwErrorToAdmin } from '@/utils/throwErrorToAdmin'
import { targetSemester, targetYear } from '../config/config'

export async function determineYearAndSemester(
  $: CheerioAPI
): Promise<boolean> {
  let raw = ''

  // Attempt 1: dropdown selector
  raw = $('#student-yearsem-select option').first().text().trim()
  if (raw) console.log(`[determineYearAndSemester] Attempt 1 (select): "${raw}"`)

  // Attempt 2: hidden input / value attribute
  if (!raw) {
    raw = ($('[name="yearsem"]').first().val() as string | undefined) ?? ''
    raw = raw.trim()
    if (raw) console.log(`[determineYearAndSemester] Attempt 2 (input[name=yearsem]): "${raw}"`)
  }

  // Attempt 3: scan all <option> text for YYYY/S pattern (MCV has multiple selects)
  if (!raw) {
    $('option').each((_i, el) => {
      const text = $(el).text().trim()
      if (/^\d{4}\/\d$/.test(text)) {
        raw = text
        return false // break
      }
    })
    if (raw) console.log(`[determineYearAndSemester] Attempt 3 (any option): "${raw}"`)
  }

  // Attempt 4: scan entire page text
  if (!raw) {
    const pageText = $.root().text()
    const match = /\b(25\d{2}|20\d{2})\/([123])\b/.exec(pageText)
    if (match) raw = `${match[1]}/${match[2]}`
    if (raw) console.log(`[determineYearAndSemester] Attempt 4 (page text scan): "${raw}"`)
  }

  const split = /(\d+)\/(\d+)/.exec(raw)

  if (!split) {
    const snippet = $('body').text().replace(/\s+/g, ' ').slice(0, 800)
    const msg =
      `[determineYearAndSemester] All 4 attempts failed.\n` +
      `Body snippet: ${snippet}`
    console.error(msg)

    if (targetYear.value !== undefined && targetSemester.value !== undefined) {
      console.warn(`[determineYearAndSemester] Keeping previous: ${targetYear.value}/${targetSemester.value}`)
      return false
    }

    await throwErrorToAdmin(msg)
    return false
  }

  const [, currentYear, currentSemester] = split
  const currentYearInt = parseInt(currentYear)
  const currentSemesterInt = parseInt(currentSemester)

  if (
    targetYear.value !== currentYearInt ||
    targetSemester.value !== currentSemesterInt
  ) {
    console.log(`[determineYearAndSemester] Semester set/updated: ${currentYear}/${currentSemester}`)
  }

  targetYear.value = currentYearInt
  targetSemester.value = currentSemesterInt
  return true
}
