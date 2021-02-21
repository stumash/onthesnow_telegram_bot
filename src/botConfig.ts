import { Slimbot, Message } from "slimbot";
import { RegisteredUserStore, User } from "./db";

/**
 * Set up the bot to react to special commands and notify registered users about upcoming snow conditions
 *
 * The bot listens to incoming messages from Telegram, and can send messages to users and groups
 * for which it knows the ID.
 */
const setupBot = (bot: Slimbot, userStore: RegisteredUserStore) => {
  bot.on("message", async (message) => {
    switch (message.text) {
      case "register":
        handleRegister(bot, message, userStore);
        break;
      case "unregister":
        handleUnregister(bot, message, userStore);
        break;
      default:
        handleDefault(bot, message);
        break;
    }
  });
};

async function handleRegister(
  bot: Slimbot,
  message: Message,
  userStore: RegisteredUserStore
): Promise<void> {
  const newUser: User = {
    telegram_id: message.chat.id,
  };

  try {
    const success = await userStore.addUser(newUser);
    if (!success) {
      // newUser already exists
      bot.sendMessage(message.chat.id, "you're already registered");
    }
  } catch (e) {
    console.log(e);
  }
}

function handleUnregister(
  bot: Slimbot,
  message: Message,
  userStore: RegisteredUserStore
): void {
  // TODO
}

function handleDefault(bot: Slimbot, message: Message): void {
  // TODO
}

export { setupBot };
