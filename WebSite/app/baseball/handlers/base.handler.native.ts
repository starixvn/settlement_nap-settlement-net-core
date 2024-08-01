import { Store } from "../services/store.service";

export interface BaseHandler {
  setNextHandler(handler: BaseHandler): void;
  handle(store: Store): void ;
}