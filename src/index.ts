import { promises as fs } from "fs";
import Slimbot from "slimbot";
import { setupBot } from "./botConfig";
import userStorePromise from "./db";

(async function () {
  const userStore = await userStorePromise;

  const token = (await fs.readFile("token", "utf8")).trim();

  // Initialize the bot.
  const bot = new Slimbot(token);

  // Set up the bot with all custom behaviour
  setupBot(bot, userStore);

  // Start listening to incoming messages from telegram
  bot.startPolling();
})();
