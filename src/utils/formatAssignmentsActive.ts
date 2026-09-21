import db from '../database/database';
import { getActiveAssignments } from '../scraper/getActiveAssignments';

export async function formatAssignmentsActive(): Promise<string> {
    const courses = await db.getAllCourses();
    const coursesCache: Record<string, string> = {};
    courses.forEach(c => { coursesCache[c.mcvID] = c.title; });

    const assignments = await getActiveAssignments(coursesCache);

    if (assignments.length === 0) {
        return '🎉 No pending assignments! (Based on Active Panel)';
    }

    const groupedAssignments: Record<string, typeof assignments> = {};
    assignments.forEach(hw => {
        if (!groupedAssignments[hw.courseTitle]) groupedAssignments[hw.courseTitle] = [];
        groupedAssignments[hw.courseTitle].push(hw);
    });

    let text = '📋 **Active Assignments**\n\n';

    for (const [courseName, hws] of Object.entries(groupedAssignments)) {
        text += `📘 **${courseName}**\n`;
        hws.forEach((hw, index) => {
            const dueDate = hw.dueDate || '-';
            text += `> 📝 [**${hw.homeworkTitle}**](${hw.link})\n`;
            text += `> ⏳ Time left: ${dueDate}\n`;

            // แทรกบรรทัดว่าง (>) เพื่อไม่ให้แต่ละงานอยู่ติดกันเกินไป
            if (index < hws.length - 1) {
                text += `> \n`;
            }
        });
        text += '\n';
    }

    if (text.length > 2000) text = text.substring(0, 1995) + '...';
    
    return text;
}