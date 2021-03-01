import Slimbot from "slimbot";
import {
  Message,
  MessageType,
  MessageEntity,
  EntityType,
  OptionalSendParams,
  ParseMode,
} from "./types/slimbotTypes";
import { DataStore, User } from "./db";

enum AcceptedCommand {
  Register = "/register",
  Unregister = "/unregister",
}

/**
 * Set up the bot to react to special commands and notify registered users about upcoming snow conditions
 *
 * The bot listens to incoming messages from Telegram, and can send messages to users and groups
 * for which it knows the ID.
 */
const setupBot = (bot: Slimbot, dataStore: DataStore) => {
  //console.log(`command: ${AcceptedCommand.Register}`);
  bot.on(MessageType.Message, async (message) => {
    // if there's no message contents from which to parse a command, handleInvalid
    if (!message.entities || !message.text) {
      handleInvalid(bot, message);
      return;
    }

    // try and parse a single entity, else handleInvalid
    let command = parseCommand(message.text, message.entities);
    if (!command) {
      handleInvalid(bot, message);
      return;
    }

    switch (command) {
      case AcceptedCommand.Register:
        handleRegister(bot, message, dataStore);
        break;
      case AcceptedCommand.Unregister:
        handleUnregister(bot, message, dataStore);
        break;
    }
  });
};

/**
 * Parse a single AcceptedCommand from the messageText and entities.
 * If there are none, return undefined.
 * If there is more than one, return undefined.
 */
function parseCommand(
  messageText: string,
  entities: MessageEntity[]
): AcceptedCommand | undefined {
  let command = undefined;
  for (const entity of entities) {
    if (command !== undefined) {
      // If you already parsed an AcceptedCommand, return undefined. There should be only one
      command = undefined;
      break;
    }

    if (entity.type !== EntityType.BotCommand) {
      // If there's any entities other than a command, return undefined
      break;
    }

    const commandText = messageText.substring(
      entity.offset,
      entity.offset + entity.length
    );
    if (commandText === AcceptedCommand.Register) {
      command = AcceptedCommand.Register;
    } else if (commandText === AcceptedCommand.Unregister) {
      command = AcceptedCommand.Unregister;
    } else {
      // If there's any invalid commands, return undefined
      break;
    }
  }

  return command;
}

async function handleRegister(
  bot: Slimbot,
  message: Message,
  dataStore: DataStore
): Promise<void> {
  const newUser: User = {
    telegram_id: message.chat.id,
  };
  if (message.chat.first_name) {
    newUser.first_name = message.chat.first_name;
  }
  if (message.chat.last_name) {
    newUser.last_name = message.chat.last_name;
  }

  try {
    const success = await dataStore.addUser(newUser);
    if (success) {
      bot.sendMessage(message.chat.id, "You've been registered successfully!");
    } else {
      // newUser already exists
      bot.sendMessage(message.chat.id, "You're already registered.");
    }
  } catch (e) {
    console.log(e);
  }
}

async function handleUnregister(
  bot: Slimbot,
  message: Message,
  dataStore: DataStore
): Promise<void> {
  const user = { telegram_id: message.chat.id };

  try {
    await dataStore.removeUser(user);
    bot.sendMessage(message.chat.id, "You are now not registered!");
  } catch (e) {
    console.log(e);
  }
}

function handleInvalid(bot: Slimbot, message: Message): void {
  const acceptedCommands = Object.values(AcceptedCommand);
  const helpMessage = [
    "```",
    "usage: <command>",
    "",
    "accepted commands:",
    ...acceptedCommands.map((s) => "  " + s), // indented
    "",
    "description:",
    "  Subscribe to updates about",
    "  upcoming snow conditions",
    "  on your chosen ski resorts",
    "```",
  ].join("\n");
  const optionalParams: OptionalSendParams = { parse_mode: ParseMode.Markdown };
  bot.sendMessage(message.chat.id, helpMessage, optionalParams);
}

export { setupBot };
