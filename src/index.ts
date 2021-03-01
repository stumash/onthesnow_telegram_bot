import { promises as fs } from "fs";
import Slimbot from "slimbot";
import { setupBot } from "./botConfig";
import dataStorePromise from "./db";

(async function () {
  const dataStore = await dataStorePromise;

  const token = (await fs.readFile("token", "utf8")).trim();

  // Initialize the bot.
  const bot = new Slimbot(token);

  // Set up the bot with all custom behaviour
  setupBot(bot, dataStore);

  // Start listening to incoming messages from telegram
  bot.startPolling();
})();
