import { ChatInputCommandInteraction, CacheType } from 'discord.js'
import db, { NotificationChannel } from '../database/database'

export default {
  name: 'setnotification',
  description: 'Set this channel as MyCourseVille notification channel',
  callback: async (
    interaction: ChatInputCommandInteraction<CacheType>,
    calledChannel: NotificationChannel
  ) => {
    const found = await db.channelOfGuildExists(calledChannel)
    if (found) {
      await interaction.editReply(
        `This server's notification channel has already been set!\nTo disable: /unsetnotification`
      )
      return
    }
    await db.saveChannel(calledChannel)
    await interaction.editReply('Done!')
  },
}
