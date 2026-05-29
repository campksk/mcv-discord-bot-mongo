import { ChatInputCommandInteraction, CacheType } from 'discord.js'
import db, { NotificationChannel } from '../database/database'

export default {
  name: 'unsetnotification',
  description: 'Unset MyCourseVille notification for this server',
  callback: async (
    interaction: ChatInputCommandInteraction<CacheType>,
    calledChannel: NotificationChannel
  ) => {
    try {
      await db.unsetChannelOfGuild(calledChannel.guildID)
      await interaction.editReply('Successfully stopped notifications for this server')
    } catch {
      await interaction.editReply(
        'An error occurred — are you sure this server has a notification channel set?'
      )
    }
  },
}
