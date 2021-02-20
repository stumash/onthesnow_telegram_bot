import { Slimbot, Message } from "slimbot";

/**
 * Set up the bot to react to special commands and notify registered users about upcoming snow conditions
 *
 * The bot listens to incoming messages from Telegram, and can send messages to users and groups
 * for which it knows the ID.
 */
const setupBot = (bot: Slimbot) => {
  bot.on("message", async (message) => {
    switch (message.text) {
      case "register":
        handleRegister(bot, message);
        break;
      case "unregister":
        handleUnregister(bot, message);
        break;
      default:
        handleDefault(bot, message);
        break;
    }
  });
};

function handleRegister(bot: Slimbot, message: Message): void {
  //
}

function handleUnregister(bot: Slimbot, message: Message): void {
  // TODO
}

function handleDefault(bot: Slimbot, message: Message): void {
  // TODO
}

export { setupBot };
