import { promises as fs } from "fs";
import Slimbot from "slimbot";
import { setupBot } from "./botConfig";

(async function () {
  // Get the bot's api token
  const token = (await fs.readFile("token", "utf8")).trim();

  // Initialize the bot.
  const bot = new Slimbot(token);

  // Set up the bot with all custom behaviour
  setupBot(bot);

  // Start listening to incoming messages from telegram
  bot.startPolling();
})();
