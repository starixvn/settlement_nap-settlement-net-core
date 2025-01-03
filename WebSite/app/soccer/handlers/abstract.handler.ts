import { Storage } from "../storage/storage.service";
import { BaseHandler } from "./base.handler";

export abstract class AbstractHandler implements BaseHandler {
  private nextHandler: BaseHandler | null = null;

  public setNextHandler(handler: BaseHandler): BaseHandler {
    this.nextHandler = handler;
    return handler;
  }

  public handle(request: Storage): void {
    if (this.nextHandler) {
      this.nextHandler.handle(request);
    }
  }
}