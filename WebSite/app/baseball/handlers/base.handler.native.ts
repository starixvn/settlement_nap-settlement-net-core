import { Storage } from "../services/storage.service";

export interface BaseHandler {
  setNextHandler(handler: BaseHandler): void;
  handle(storage: Storage): void ;
}