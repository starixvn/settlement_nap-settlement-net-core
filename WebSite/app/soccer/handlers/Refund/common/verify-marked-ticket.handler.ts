import { inject } from "@angular/core";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from "../../../../shared/language.native";
import { RequestService } from "../../../components/sop-refund/services/request.service";
import { RefundBaseStorage } from "../../../storage/storage.service.native";

export class VerifyMarkedTicketHandler extends AbstractHandler {
  readonly #requestService = inject(RequestService);

  async handle(storage: RefundBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    const resourceIds = storage.getSelectedResource().map(x => x.resourceId).join(',');

    const markedTicket = await this.#requestService.checkingMarkedTicket(resourceIds, matchDetail.matchId);
    if (markedTicket.isExistMarkedTicket) {
      storage.error(Language.MarkedTicket);
    } else {
      super.handle(storage);
    }
  }
}