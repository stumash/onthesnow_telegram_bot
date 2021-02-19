(async function () {
  // Get the bot's api token
  const fs = require("fs").promises;
  const token = (await fs.readFile(".token", "utf8")).trim();

  // Initialize the bot.
  // The bot listens to incoming messages from Telegram, and can send messages to users and groups
  // for which it knows the ID.
  const Slimbot = require("slimbot");
  const bot = new Slimbot(token);

  // Set up the bot with all custom behaviour
  const botConfig = require("./botConfig");
  botConfig.setupBot(bot);

  // Start listening to incoming messages from telegram
  bot.startPolling();
})();
