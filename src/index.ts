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

  // here's an example url that serves pure json for a given ski resort
  // the json includes the weather report - and much more
  // https://www.onthesnow.com/_next/data/0.6.9_en-US/vermont/stowe-mountain-resort/skireport.json
  // https://www.onthesnow.com/_next/data/0.6.9_en-US/wyoming/jackson-hole/skireport.json

  // Start listening to incoming messages from telegram
  bot.startPolling();
})();
