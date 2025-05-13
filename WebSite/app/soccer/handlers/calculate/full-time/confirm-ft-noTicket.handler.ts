import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { MessageBoxService } from "../../../../shared/services";
import { inject } from "@angular/core";
import { RequestService } from "../../../components/calc/services/request.service";
import { CalculateAction, ResourceIds, ResultStatusId, ScoreSourceType, } from "../../../../shared/constants";
import * as _ from "lodash";

export class ConfirmFtNoTicketHandler extends AbstractHandler {
  #messageBoxService = inject(MessageBoxService);
  #requestService = inject(RequestService);
  readonly resultSettledStatusIds = [ResultStatusId.AutoCompleted, ResultStatusId.ManualCompleted];
  readonly sourceTypeIds = [ScoreSourceType.trader, ScoreSourceType.Sbo];

  async handle(storage: Storage) {
    const { matchDetail, resultDetails } = storage.getMatch();
    const halfTimeResult = storage.getHalfTimeResult();

    const isHalfTimeSettled = this.resultSettledStatusIds.includes(halfTimeResult.resultStatusId);

    const ticketCounts = await this.#requestService.countTickets(matchDetail.matchId);
    const isExistsTicket = ticketCounts.some(x => ["1H", "2H", "BothHalf"].includes(x.groupResult) && x.totalTicket > 0);

    const isExistsHtSourceResult = resultDetails
      .filter(x => x.resourceId === ResourceIds.halfTime && this.sourceTypeIds.includes(x.sourceId))
      .some(x => !_.isEmpty(x.homeValue) && !_.isEmpty(x.awayValue));

    if (!halfTimeResult.checked && !isHalfTimeSettled && !isExistsTicket && !isExistsHtSourceResult) {
      const confirmMessage = `${Language.soccer.confirmAutoSelectFtNoTicket}`;
      storage.setConfirmMessage(confirmMessage);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        halfTimeResult.homeValue = '0';
        halfTimeResult.awayValue = '0';
        halfTimeResult.checked = true;

        storage.setIsIgnoreCheckHt(true);
        storage.setCalculateAction(CalculateAction.calculate);
        super.handle(storage);
      });
      return;
    }
    super.handle(storage);
  }
}