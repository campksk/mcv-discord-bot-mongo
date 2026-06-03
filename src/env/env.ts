import * as dotenv from 'dotenv'
import { cleanEnv, str, bool, num } from 'envalid'

dotenv.config({ path: './.env' })

const env = cleanEnv(process.env, {
  MONGODB_URL: str(),
  DISCORD_TOKEN: str(),
  CLIENT_ID: str(),
  ADMIN_USER_ID: str(),
  COOKIE: str(),
  DELAY: num(),
  ERROR_FETCHING_NOTIFICATION: bool({ default: false }),
})

export default env
