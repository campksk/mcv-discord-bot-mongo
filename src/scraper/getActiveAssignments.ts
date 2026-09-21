import fetchAndCatch from '../utils/fetchAndCatch';

export interface ActiveAssignment {
    courseCid: string;
    courseTitle: string;
    homeworkTitle: string;
    dueDate: string;
    link: string; 
}

export async function getActiveAssignments(coursesCache: Record<string, string>): Promise<ActiveAssignment[]> {
    const URL = 'https://www.mycourseville.com/?q=courseville/ajax/getactivepanelcontent';
    
    // สร้าง FormData ขึ้นมาเพื่อส่งผ่าน fetchAndCatch ให้เหมือนคำสั่งอื่นๆ
    const body = new FormData();
    
    // ส่ง body แนบไปด้วย
    const response = await fetchAndCatch(URL, 'POST', body);
    
    if (!response) {
        throw new Error('ระบบจัดการ Request ภายใน (fetchAndCatch) คืนค่า undefined - อาจติดปัญหาตอนส่ง Body หรือ Network');
    }
    
    let resp: any;
    try {
        resp = await response.json();
    } catch (e) {
        throw new Error(`เซิร์ฟเวอร์ไม่ได้ตอบกลับมาเป็น JSON (HTTP Status: ${response.status})`);
    }

    const htmlDoc = resp.html;

    if (typeof htmlDoc !== 'string') {
        console.error("CourseVille Raw Response:", resp);
        throw new Error("ไม่พบข้อมูล HTML จาก API");
    }

    // ดึงลิงก์ของการบ้านทั้งหมดออกมา
    const linkMatches = Array.from(htmlDoc.matchAll(/<a target="_blank" href="(.+?)">/g)) as RegExpMatchArray[];
    const hwMatches = Array.from(htmlDoc.matchAll(/<strong>&ldquo;(.+?)&rdquo;<\/strong>(.+?)<strong>(.+?)<\/strong>/g)) as RegExpMatchArray[];
    
    const assignments: ActiveAssignment[] = [];

    for (let i = 0; i < hwMatches.length; i++) {
        const hwTitle = hwMatches[i][1];
        const dueDate = hwMatches[i][3];
        
        const rawLink = linkMatches[i]?.[1] || '';
        const cvCid = rawLink.split('/')[2] || 'unknown'; 
        
        const link = rawLink.startsWith('http') 
            ? rawLink 
            : (rawLink.startsWith('?') ? `https://www.mycourseville.com/${rawLink}` : `https://www.mycourseville.com/?q=${rawLink}`);

        const courseTitle = coursesCache[cvCid] || cvCid;

        assignments.push({
            courseCid: cvCid,
            courseTitle: courseTitle,
            homeworkTitle: hwTitle,
            dueDate: dueDate,
            link: link
        });
    }

    return assignments;
}