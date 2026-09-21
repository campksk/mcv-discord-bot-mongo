import { TextChannel } from 'discord.js';
import { AssignmentDashboardModel } from '../database/models';
// อัปเดต Import ให้ตรงกับไฟล์ใหม่
import { formatAssignmentsActive } from './formatAssignmentsActive';
import { client } from '../server'; 

// เปลี่ยนชื่อฟังก์ชันเป็น refreshAssignmentsActive
export async function refreshAssignmentsActive() {
    try {
        const dashboards = await AssignmentDashboardModel.find();
        if (dashboards.length === 0) return;

        // เรียกใช้ฟังก์ชันชื่อใหม่
        const newText = await formatAssignmentsActive();
        const updatedText = newText + `\n*(Last updated: <t:${Math.floor(Date.now() / 1000)}:R>)*`;

        for (const board of dashboards) {
            try {
                const channel = await client.channels.fetch(board.channelID) as TextChannel;
                if (!channel) continue;
                
                const msg = await channel.messages.fetch(board.messageID);
                if (msg) {
                    await msg.edit(updatedText); 
                }
            } catch (err) {
                console.error(`Could not find the original message in guild ${board.guildID} (it might have been deleted)`);
            }
        }
    } catch (err) {
        console.error("Error refreshing active assignments:", err);
    }
}