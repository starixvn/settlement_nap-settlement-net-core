import { inject } from "@angular/core";
import { Store } from "../../services/store.service";
import { BaseHandler } from "../base.handler.native";
import { AioService } from "../../../shared/services";
import { NotifyService } from "../../services/notify.service";
import { Language } from "../../../shared/language.native";

export class CheckMarkedTicketHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  #aioService = inject(AioService);
  #notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(store: Store) {
    const paramsCheckingMarkedTickets = {
      matchId: store.getMatchDetail().matchId,
      selectedResources: store.getResultChecked()
    };
    const res = await this.#aioService.checkMarkedTickets(paramsCheckingMarkedTickets);
    if (res.isExistMarkedTicket) {
      this.#notifyService.error(Language.MarkedTicket);
    } else {
      this.#notifyService.confirm(Language.RefundConfirmMessageEarly, () => {
        this.nextHandler.handle(store);
      });
    }
  }
}