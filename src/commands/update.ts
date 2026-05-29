import { ChatInputCommandInteraction, CacheType } from 'discord.js'
import { NotificationChannel } from '../database/database'
import updateHandler from '@/utils/updateHandler'

export default {
  name: 'update',
  description: 'Manually update assignments list',
  callback: async (
    interaction: ChatInputCommandInteraction<CacheType>,
    _calledChannel: NotificationChannel
  ) => {
    const isUpToDate = await updateHandler()
    if (isUpToDate) {
      await interaction.editReply('Assignments are up to date!')
    } else {
      await interaction.editReply('Done!')
    }
  },
}
