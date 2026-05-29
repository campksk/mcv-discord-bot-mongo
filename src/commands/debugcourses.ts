import { ChatInputCommandInteraction, CacheType } from 'discord.js'
import { NotificationChannel } from '../database/database'
import updateCourses from '../scraper/updateCourses'
import db from '../database/database'

export default {
  name: 'debugcourses',
  description: '[DEBUG] Force-run updateCourses and show what is in DB',
  callback: async (
    interaction: ChatInputCommandInteraction<CacheType>,
    _calledChannel: NotificationChannel
  ) => {
    await interaction.editReply('Running updateCourses, check server logs...')
    try {
      await updateCourses()
      const courses = await db.getAllCoursesOfTargetSemester()
      if (courses.length === 0) {
        await interaction.followUp({
          content: '⚠️ No courses found in DB for current semester. Check server logs for details.',
          ephemeral: true,
        })
      } else {
        const list = courses.map((c) => `- [${c.mcvID}] ${c.title}`).join('\n')
        await interaction.followUp({
          content: `✅ Found **${courses.length}** course(s):\n${list}`.slice(0, 1900),
          ephemeral: true,
        })
      }
    } catch (e) {
      await interaction.followUp({
        content: `❌ Error: ${e}`,
        ephemeral: true,
      })
    }
  },
}
