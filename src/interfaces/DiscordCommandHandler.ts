import { CacheType, ChatInputCommandInteraction } from 'discord.js'
import { NotificationChannel } from '../database/database'

export default interface DiscordCommandHandler {
  [name: string]: {
    description: string
    callback: (
      interaction: ChatInputCommandInteraction<CacheType>,
      calledChannel: NotificationChannel
    ) => Promise<unknown>
  }
}
