import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { MessageBoxService } from "../../../../shared/services";
import {  inject } from "@angular/core";
import { RequestService } from "../../../components/calc/services/request.service";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";

export class ConfirmFtNoTicketHandler extends AbstractHandler {
  #messageBoxService = inject(MessageBoxService);
  #requestService = inject(RequestService);
  #verifyScoreGoalService =  inject(VerifyScoreGoalService)

  async handle(storage: Storage) {
    const { matchDetail } = storage.getMatch();
    const halfTimeResult = storage.getHalfTimeResult();
    const confirmMessage = `${Language.soccer.confirmAutoSelectFtNoTicket}`;
    const ticketCounts = await this.#requestService.countTickets(matchDetail.matchId);
    const isExistsTicket = ticketCounts.some(x => ["1H","2H","BothHalf"].includes(x.groupResult) && x.totalTicket > 0);
    
    if(!halfTimeResult.checked && !this.#verifyScoreGoalService.isHalfTimeSettled(matchDetail) && !isExistsTicket) {
      storage.setConfirmMessage(confirmMessage);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        halfTimeResult.homeValue = '0';
        halfTimeResult.awayValue = '0';
        halfTimeResult.checked = true;
        super.handle(storage);
      });
      return;
    }
    super.handle(storage);
  }
}