import { load, CheerioAPI } from 'cheerio'
import { isCookieInvalid } from './isCookieInvalid'

export default async function responseToCheerio(
  response: Response | undefined
): Promise<CheerioAPI | undefined> {
  if (response == undefined) return undefined
  const html = await response.text()
  const $ = load(html)
  if (await isCookieInvalid($)) return undefined
  return $
}
