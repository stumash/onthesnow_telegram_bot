declare module "slimbot" {
  import * as S from "src/types/slimbot";

  class Slimbot {
    constructor(token: string): Slimbot;

    startPolling(): void;

    on(
      commandName: S.MessageType,
      callback: (message: S.Message) => void
    ): void;

    sendMessage(
      id: string,
      message: string,
      optionalParams?: S.OptionalSendParams
    ): Promise<S.SentMessageResult>;
  }

  export default Slimbot;
}
