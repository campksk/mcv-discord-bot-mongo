# 🎓 MCV Discord Bot (MongoDB)

A Discord bot designed for students using **MyCourseVille (MCV)**. It automatically scrapes course data, notifies your server about new assignments, and maintains a live, auto-updating dashboard of active homework—ensuring you and your friends never miss a deadline.

## ✨ Features

- 🔔 **Automated Notifications**: Automatically fetches and announces newly posted assignments to your designated Discord channels.
- 📊 **Live Assignment Dashboard**: Generates an interactive, auto-updating message (`/assignmentactive`) that lists all pending assignments grouped by course, complete with clickable links and dynamic Discord countdown timers.
- 🗄️ **MongoDB Integration**: Efficiently stores course details, previous assignments, and notification settings using MongoDB.
- ⚙️ **Slash Commands**: Easy-to-use Discord slash commands for seamless server management.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed and set up:
- **Node.js** (v16.x or newer)
- **MongoDB** (Local instance or MongoDB Atlas)
- **Discord Bot Token** (Get one from the [Discord Developer Portal](https://discord.com/developers/applications))
- **MyCourseVille Session Cookie** (Used by the bot to access your assignments)

---

## 🚀 Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/campksk/mcv-discord-bot-mongo.git
cd mcv-discord-bot-mongo

```

**2. Install dependencies**

```bash
npm install

```

**3. Configure Environment Variables**
Rename the `.env.example` file to `.env` and fill in your credentials:

```env
# Database
MONGODB_URL=mongodb://username:password@your-server-ip:27017/mcv-discord-bot

# Discord
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
ADMIN_USER_ID=your_discord_user_id_here

# MyCourseVille
COOKIE=your_cookie_from_document_cookie

# Bot Settings
DELAY=120
ERROR_FETCHING_NOTIFICATION=false

```

*(**Note:** The MCV cookie expires periodically. You can easily get a fresh `cv_session` cookie by logging into https://www.mycourseville.com/, opening your browser's Developer Console (F12), typing `document.cookie`, and pressing Enter.)*

**4. Start the bot**

* **For Development:**
```bash
npm run dev

```


* **For Production:**
```bash
npm run build
npm start

```



---

## 💻 Usage & Commands

Once the bot is invited to your server and running, you can use the following Slash Commands:

| Command | Description |
| --- | --- |
| `/assignmentactive` | 🌟 **(Recommended)** Creates a live dashboard in the current channel displaying all active assignments. The bot will automatically update the time left. |
| `/setnotification` | Sets the current channel as the destination for new assignment alerts. |
| `/unsetnotification` | Stops sending new assignment alerts to the current channel. |
| `/update` | Manually triggers the bot to scrape for new courses and assignments immediately. |
| `/debugcourses` | Developer command to check the list of fetched courses and their IDs. |

### 💡 Pro-Tip for the Live Dashboard

Use `/assignmentactive` in a dedicated, read-only channel (e.g., `#homework-board`). The bot will generate a clean list of tasks and automatically refresh the countdown timers without sending new messages.

---

## 🛠️ Built With

* [Discord.js](https://discord.js.org/?utm_source=gemini) - The Discord API wrapper
* [TypeScript](https://www.typescriptlang.org/?utm_source=gemini) - For robust and type-safe code
* [Mongoose](https://mongoosejs.com/?utm_source=gemini) - MongoDB object modeling
* [Cheerio](https://cheerio.js.org/?utm_source=gemini) - For parsing MCV HTML data

---

## 🙏 Acknowledgments

This project is built upon the foundation of the original [mcv-discord-bot](https://github.com/CEDT-Chula/mcv-discord-bot?utm_source=gemini) created by the CEDT-Chula team. Huge thanks to the original contributors for their open-source work!

## ⚠️ Disclaimer

This is an unofficial project and is not affiliated with, maintained, or endorsed by MyCourseVille or Chulalongkorn University. Please use it responsibly and do not spam API requests.
