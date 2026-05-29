import * as fs from 'fs'
import path from 'path'
import DiscordCommandHandler from '../interfaces/DiscordCommandHandler'

export async function getCommands(): Promise<DiscordCommandHandler> {
  const commands: DiscordCommandHandler = {}
  const commandFiles = fs.readdirSync(path.join(__dirname, '../commands'))
  await Promise.all(
    commandFiles.map(async (file) => {
      const { default: command } = await import(`../commands/${file}`)
      commands[command.name] = command
    })
  )
  return commands
}

export function toDiscordCommandBody(commands: DiscordCommandHandler) {
  return Object.entries(commands).map(([key, value]) => ({
    name: key,
    description: value.description,
  }))
}
