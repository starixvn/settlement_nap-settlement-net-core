import { CalculateStore } from "../services/calculate/calculate.store";
import { NotifyService } from "../services/notify.service";

export interface BaseHandler {
  setNextHandler(handler: BaseHandler): void;
  handle(): void ;
}