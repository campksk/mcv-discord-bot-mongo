import { CheerioAPI } from 'cheerio'
import { throwErrorToAdmin } from './throwErrorToAdmin'

export async function isCookieInvalid($: CheerioAPI): Promise<boolean> {
  if ($('#courseville-login-w-platform-cu-button').length !== 0) {
    await throwErrorToAdmin('Cookie is invalid')
    return true
  }
  return false
}
