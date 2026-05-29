# MCV Discord Bot (MongoDB Edition)

Discord bot แจ้งเตือน assignment จาก MyCourseVille รันบน **Raspberry Pi 2** โดยใช้ **MongoDB** บน remote server

## Requirements

- Node.js ≥ 18 (สำหรับ Raspberry Pi 2 ใช้ **armv7l** build)
- MongoDB บน remote server

---

## ติดตั้ง Node.js 18 บน Raspberry Pi 2 (armv7l)

```bash
# ดาวน์โหลด Node.js 18 armv7l binary
wget https://unofficial-builds.nodejs.org/download/release/v18.20.4/node-v18.20.4-linux-armv7l.tar.xz
tar -xf node-v18.20.4-linux-armv7l.tar.xz
sudo cp -r node-v18.20.4-linux-armv7l/* /usr/local/

# ตรวจสอบ
node -v  # v18.x.x
npm -v
```

> **หมายเหตุ:** Raspberry Pi 2 ใช้ ARMv7 ซึ่ง Node.js ไม่รองรับ official binary ตั้งแต่ v12+
> ให้ดาวน์โหลดจาก [unofficial-builds.nodejs.org](https://unofficial-builds.nodejs.org/download/release/)

---

## ติดตั้งโปรเจกต์

```bash
git clone <your-repo>
cd mcv-discord-bot

npm install

# Copy และแก้ไข .env
cp .env.example .env
nano .env
```

### ค่าที่ต้องกรอกใน .env

| ตัวแปร | คำอธิบาย |
|---|---|
| `MONGODB_URL` | MongoDB connection string เช่น `mongodb://user:pass@192.168.1.10:27017/mcvbot` |
| `DISCORD_TOKEN` | Bot token จาก Discord Developer Portal |
| `CLIENT_ID` | Application ID ของ bot |
| `ADMIN_USER_ID` | Discord User ID ของ admin |
| `COOKIE` | Cookie จาก MyCourseVille (`document.cookie` ใน browser) |
| `DELAY` | ระยะเวลา (วินาที) ระหว่างการ fetch เช่น `300` |
| `ERROR_FETCHING_NOTIFICATION` | `true`/`false` แจ้งเตือนเมื่อ fetch error |
| `AUTO_DETERMINE_YEAR_AND_SEMESTER` | `true` ให้ bot หาปีการศึกษาเอง |

---

## Build และรัน

```bash
# Build TypeScript
npm run build

# รัน
npm start
```

หรือรันแบบ development (ไม่ต้อง build):

```bash
npm run startTs
```

---

## ตั้งค่าให้รันอัตโนมัติด้วย systemd

สร้างไฟล์ `/etc/systemd/system/mcv-bot.service`:

```ini
[Unit]
Description=MCV Discord Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/mcv-discord-bot
ExecStart=/usr/local/bin/node /home/pi/mcv-discord-bot/build/start.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable mcv-bot
sudo systemctl start mcv-bot

# ดู log
journalctl -u mcv-bot -f
```

---

## Commands

| Command | คำอธิบาย |
|---|---|
| `/setnotification` | ตั้ง channel นี้เป็นช่องรับแจ้งเตือน |
| `/unsetnotification` | ยกเลิกการแจ้งเตือนของ server |
| `/update` | อัปเดต assignment รายการใหม่ทันที |

---

## โครงสร้างโปรเจกต์

```
src/
├── commands/          # Discord slash commands
├── config/            # ค่า config ต่างๆ
├── database/
│   ├── models.ts      # Mongoose schemas (Course, Assignment, NotificationChannel)
│   ├── mongoose.ts    # MongoDB connection
│   ├── database.ts    # Database access layer
│   └── cache.ts       # In-memory cache (node-cache)
├── discord/           # Discord command registration
├── env/               # Environment variable validation
├── interfaces/        # TypeScript interfaces
├── scraper/           # MyCourseVille web scraper
├── utils/             # Utility functions
├── server.ts          # Discord client setup
└── start.ts           # Entry point
```

---

## การย้ายข้อมูลจาก PostgreSQL

ไม่มี migration script สำเร็จรูป แต่โครงสร้าง MongoDB ตรงกับเดิม:
- `Course` → collection `courses`
- `Assignment` → collection `assignments`  
- `NotificationChannel` → collection `notificationchannels`

Bot จะสร้าง index และ collection ให้อัตโนมัติเมื่อ connect ครั้งแรก
