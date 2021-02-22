declare module "slimbot" {
  import * as t from "src/types/slimbot";

  class Slimbot {
    constructor(token: string): Slimbot;

    startPolling(): void;

    on(
      commandName: t.MessageType,
      callback: (message: t.Message) => void
    ): void;

    sendMessage(
      id: string,
      message: string,
      optionalParams?: t.OptionalSendParams
    ): Promise<t.SentMessageResult>;
  }

  export default Slimbot;
}
