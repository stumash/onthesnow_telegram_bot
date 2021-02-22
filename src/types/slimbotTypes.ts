export enum MessageType {
  Message = "message",
  EditedMessage = "edited_message",
  ChannelPost = "channel_post",
  EditedChannelPost = "edited_channel_post",
  CallbackQuery = "callback_query",
  InlineQuery = "inline_query",
  ChosenInlineResult = "chosen_inline_result",
  ShippingQuery = "shipping_query",
  PreCheckoutQuery = "pre_checkout_query",
  Poll = "poll",
  PollAnswer = "poll_answer",
}

export interface OptionalSendParams {
  parseMode?: ParseMode;
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  reply_to_message_id?: number;
}

export enum ParseMode {
  Markdown = "Markdown",
}

export interface SentMessageResult {
  ok: boolean;
  result: Message;
}

export enum ComandName {
  Message = "message",
}

export interface Message {
  chat: Chat;
  from?: User;
  text?: string;
  entities?: MessageEntity[];
  messageId: number; // count starting at 1 of how many messages sent from chat to the bot
  date: number; // ISO date in milliseconds
}

export interface User {
  id: string;
  is_bot: boolean;
  first_name: string;
  last_name: string;
  username: string;
  language_code: LanguageCode;
}

export enum LanguageCode {
  English = "en",
}

export interface Chat {
  id: string;
  type: ChatType;
  first_name?: string;
  last_name?: string;
}

export enum ChatType {
  Private = "private",
}

export interface MessageEntity {
  type: EntityType;
  offset: number;
  length: number;
}

export enum EntityType {
  Mention = "mention",
  Hashtag = "hashtag",
  Cashtag = "cashtag",
  BotCommand = "bot_command",
  Url = "url",
  Email = "email",
  PhoneNumber = "phone_number",
}
