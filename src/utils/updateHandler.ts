import { ChannelType, DiscordAPIError, NewsChannel, TextChannel } from 'discord.js'
import db from '../database/database'
import { updateAll } from '../scraper/updateAll'
import { adminDM, client } from '../server'
import retryOnRateLimit from './Retryonratelimit'

/**
 * Update assignments and send messages to all notification channels.
 * Returns true  → no new assignments
 * Returns false → new assignments were found & sent
 * Returns undefined → an error occurred
 */
export default async function updateHandler(): Promise<boolean | undefined> {
  let messages: string[] = []
  try {
    messages = await updateAll()
  } catch (e) {
    console.trace(e)
    return undefined
  }

  if (messages.length === 0) return true

  const channels = await db.getAllChannels()
  for (const message of messages) {
    for (const notificationChannel of channels) {
      try {
        const discordChannel = (await client.channels.fetch(
          notificationChannel.channelID
        )) as TextChannel | NewsChannel
        const sentMessage = await discordChannel.send(message)

        // If this is an Announcement channel, publish it so all
        // servers/channels that follow it also receive the message.
        // Crosspost has its own rate limit (10/hour/channel) separate from
        // sending messages, so retry with backoff if we hit it.
        if (discordChannel.type === ChannelType.GuildAnnouncement) {
          await retryOnRateLimit(() => sentMessage.crosspost())
        }
      } catch (err) {
        console.trace(err)
        if (!(err instanceof DiscordAPIError)) {
          adminDM.send(JSON.stringify(err))
        }
      }
    }
  }
  return false
}