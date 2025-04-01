import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { MessageBoxService } from "../../../../shared/services";
import {  inject } from "@angular/core";
import { RequestService } from "../../../components/calc/services/request.service";
import { CalculateAction, ResultStatusId } from "../../../../shared/constants";

export class ConfirmFtNoTicketHandler extends AbstractHandler {
  #messageBoxService = inject(MessageBoxService);
  #requestService = inject(RequestService);

  async handle(storage: Storage) {
    const { matchDetail } = storage.getMatch();
    const halfTimeResult = storage.getHalfTimeResult();
    const isHalfTimeSettled = [ResultStatusId.AutoCompleted, ResultStatusId.ManualCompleted].includes(halfTimeResult.resultStatusId);
    const outsideHtResult = storage.getOutsideHtResult();
    const confirmMessage = `${Language.soccer.confirmAutoSelectFtNoTicket}`;
    const ticketCounts = await this.#requestService.countTickets(matchDetail.matchId);
    const isExistsTicket = ticketCounts.some(x => ["1H","2H","BothHalf"].includes(x.groupResult) && x.totalTicket > 0);
    
    if(!halfTimeResult.checked && !isHalfTimeSettled && !isExistsTicket) {
      storage.setConfirmMessage(confirmMessage);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        halfTimeResult.homeValue = '0';
        halfTimeResult.awayValue = '0';
        halfTimeResult.checked = true;

        outsideHtResult.homeValue = '0';
        outsideHtResult.awayValue = '0';
        storage.setIsIgnoreCheckFt(true);
        storage.setCalculateAction(CalculateAction.calculate);
        super.handle(storage);
      });
      return;
    }
    super.handle(storage);
  }
}