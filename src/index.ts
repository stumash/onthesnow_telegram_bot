import { promises as fs } from "fs"
import Slimbot from "slimbot"
import { setupBot } from "./botConfig"
import { startScheduler } from "./scheduler"
import { config } from "../package.json"
import DataStore from "./db"

const main = async () => {
  const dataStore = await DataStore.asyncConstructor(config.dbFile)

  const token = (await fs.readFile("token", "utf8")).trim()

  // Initialize the bot.
  const bot = new Slimbot(token)

  // Set up the bot with all custom behaviour
  setupBot(bot, dataStore)

  // Schedule daily jobs to scrape fresh snow reports
  // TODO startScheduler(bot, dataStore)

  console.log('past scheduler')

  // Start listening to incoming messages from telegram
  bot.startPolling()
}
main()
