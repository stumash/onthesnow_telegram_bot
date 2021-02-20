declare module "slimbot" {
  declare class Slimbot {
    constructor(token: string): Slimbot;

    startPolling(): void;

    on(commandName: CommandName, callback: (message: Message) => void): void;

    sendMessage(
      id: string,
      message: string,
      optionalParams?: OptionalSendParams
    ): Promise<SentMessageResult>;
  }

  declare interface OptionalSendParams {
    parseMode: ParseMode;
    disable_web_page_preview: boolean;
    disable_notification: boolean;
    reply_to_message_id: number;
  }

  declare enum ParseMode {
    Markdown = "Markdown",
  }

  declare interface SentMessageResult {
    ok: boolean;
    result: Message;
  }

  declare enum ComandName {
    Message = "message",
  }

  declare interface Message {
    chat: Chat;
    from?: User;
    text: string;
    messageId: number; // count starting at 1 of how many messages sent from chat to the bot
    date: number; // ISO date in milliseconds
  }

  declare interface User {
    id: string;
    is_bot: boolean;
    first_name: string;
    last_name: string;
    username: string;
    language_code: LanguageCode;
  }

  declare enum LanguageCode {
    English = "en",
  }

  declare interface Chat {
    id: string;
    type: ChatType;
  }

  declare enum ChatType {
    Private = "private",
  }

  export default Slimbot;
  export { Slimbot, Message };
}
