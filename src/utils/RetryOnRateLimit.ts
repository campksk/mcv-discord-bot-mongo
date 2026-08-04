import { DiscordAPIError } from 'discord.js'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Runs `fn`, retrying with exponential backoff if Discord responds with a
 * 429 (rate limited) DiscordAPIError. Respects the `retry_after` value
 * Discord returns when available, otherwise falls back to a doubling delay.
 *
 * @param fn        The action to attempt (e.g. a crosspost/send call)
 * @param maxRetries Maximum number of retry attempts after the first try
 * @param baseDelayMs Starting backoff delay in ms, used when Discord gives no retry_after
 */
export default async function retryOnRateLimit<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  baseDelayMs = 1000
): Promise<T> {
  let attempt = 0

  while (true) {
    try {
      return await fn()
    } catch (err) {
      const isRateLimited =
        err instanceof DiscordAPIError && (err.status === 429 || err.code === 429)

      if (!isRateLimited || attempt >= maxRetries) {
        throw err
      }

      // Discord's rawError usually includes retry_after (in seconds) for 429s
      const rawRetryAfter = (err.rawError as { retry_after?: number } | undefined)
        ?.retry_after
      const delayMs =
        rawRetryAfter != null
          ? Math.ceil(rawRetryAfter * 1000)
          : baseDelayMs * 2 ** attempt

      attempt++
      console.warn(
        `Rate limited, retrying in ${delayMs}ms (attempt ${attempt}/${maxRetries})`
      )
      await sleep(delayMs)
    }
  }
}