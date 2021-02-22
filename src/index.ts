import { promises as fs } from "fs";
import Slimbot from "slimbot";
import { setupBot } from "./botConfig";
import userStorePromise from "./db";

(async function () {
  const userStore = await userStorePromise;

  console.log("add user");
  let us = await userStore.addUser({ telegram_id: "2", first_name: "me" });

  console.log("all users");
  for (let user of await userStore.getUsers()) {
    console.log("USER");
    console.log(user);
  }

  console.log("remove user");
  try {
    let rs = userStore.removeUser({ telegram_id: "2" });
  } catch (e) {
    console.log("FUCK IT");
    console.log(e);
    console.log("FUCK IT");
  }

  console.log("all users");
  for (const user of await userStore.getUsers()) {
    console.log(user);
  }

  // Get the bot's api token
  //const token = (await fs.readFile("token", "utf8")).trim();

  // Initialize the bot.
  //const bot = new Slimbot(token);

  // Set up the bot with all custom behaviour
  //setupBot(bot, userStore);

  // Start listening to incoming messages from telegram
  //bot.startPolling();
})();
