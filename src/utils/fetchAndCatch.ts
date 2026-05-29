import env from '../env/env'
import { hasEncounteredError } from '../server'
import errorFetchingNotify from './errorFetchingNotify'
import { NotifyMessage } from '../config/config'

/**
 * @throws {InvalidCookieError}
 */
export default async function fetchAndCatch(
  url: string,
  method: string,
  body?: BodyInit
): Promise<Response | undefined> {
  const response = await fetch(url, {
    method,
    headers: { Cookie: env.COOKIE },
    body,
  }).catch(async (_e) => {
    if (hasEncounteredError.value) return
    hasEncounteredError.value = true
    await errorFetchingNotify(NotifyMessage.FetchingError)
  })

  if (response == undefined) return undefined

  if (response.status !== 200) {
    if (hasEncounteredError.value) return undefined
    hasEncounteredError.value = true
    await errorFetchingNotify(NotifyMessage.FetchingError)
    return undefined
  }

  hasEncounteredError.value = false
  return response
}
