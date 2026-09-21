import { ChatInputCommandInteraction, CacheType, TextChannel } from 'discord.js'
import { NotificationChannel } from '../database/database'
// อัปเดต Import
import { formatAssignmentsActive } from '../utils/formatAssignmentsActive'
import { AssignmentDashboardModel } from '../database/models'

export default {
  name: 'assignmentactive',
  description: 'Create an auto-updating active assignments dashboard in this channel',
  callback: async (
    interaction: ChatInputCommandInteraction<CacheType>,
    _calledChannel: NotificationChannel
  ) => {
    try {
      // อัปเดตการเรียกใช้ฟังก์ชัน
      const text = await formatAssignmentsActive();
      
      const updatedText = text + `\n*(Last updated: <t:${Math.floor(Date.now() / 1000)}:R>)*`;

      const channel = interaction.channel as TextChannel;
      const msg = await channel.send(updatedText);

      await AssignmentDashboardModel.findOneAndUpdate(
        { guildID: interaction.guildId },
        { 
          channelID: interaction.channelId, 
          messageID: msg.id 
        },
        { upsert: true, new: true }
      );

      await interaction.editReply({
        content: '✅ Auto-updating assignment dashboard created successfully!',
      });

    } catch (error) {
      console.error('Error creating assignment dashboard:', error);
      await interaction.editReply(`❌ An error occurred: ${error instanceof Error ? error.message : error}`);
    }
  },
}