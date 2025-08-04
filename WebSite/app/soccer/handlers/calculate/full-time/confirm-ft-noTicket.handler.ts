import { AbstractHandler } from "../../abstract.handler.native";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { MessageBoxService } from "../../../../shared/services";
import { inject } from "@angular/core";
import { RequestService } from "../../../components/calc/services/request.service";
import { CalculateAction, ResourceIds, ResultStatusId, ScoreSourceType, } from "../../../../shared/constants";
import * as _ from "lodash";
import { SourceIds } from "../../../../basketball/constants/source-ids";
import { ExternalResult, ResultDetail } from "../../../../shared/models/sportsbook-sop";

export class ConfirmFtNoTicketHandler extends AbstractHandler {
  #messageBoxService = inject(MessageBoxService);
  #requestService = inject(RequestService);
  readonly resultSettledStatusIds = [ResultStatusId.AutoCompleted, ResultStatusId.ManualCompleted];
  readonly sourceTypeIds = [ScoreSourceType.trader, ScoreSourceType.Sbo];

  async handle(storage: CalculateBaseStorage) {
    const { matchDetail, externalResults } = storage.getMatch();
    const halfTimeResult = storage.getHalfTimeResult();
    const fullTimeResult = storage.getFullTimeResult();

    const ticketCounts = await this.#requestService.countTickets(matchDetail.matchId);
    const isExistsTicket = ticketCounts.some(x => ["1H", "2H", "BothHalf"].includes(x.groupResult) && x.totalTicket > 0);
    const isHalfTimeSettledOrConfirmed = this.isHalfTimeSettledOrConfirmed(halfTimeResult, externalResults);
    const isFTConfirmed = fullTimeResult.resultStatusId === ResultStatusId.TraderConfirm;
    if (isExistsTicket || isHalfTimeSettledOrConfirmed) {
      super.handle(storage);
      return;
    }

    if (isFTConfirmed) {
      const confirmMessage = `${Language.soccer.confirmAutoSelectFtNoTicket}`;
      storage.setConfirmMessage(confirmMessage);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        this.setValueHalfTime(storage);

        storage.setIsIgnoreCheckHt(true);
        storage.setCalculateAction(CalculateAction.calculate);
        super.handle(storage);
      });
    } else {
      storage.error(Language.soccer.halfTimeNotSettleYet);
    }

  }

  private isHalfTimeSettledOrConfirmed(halfTimeResult: ResultDetail, externalResults: ExternalResult[]) {
    const isHalfTimeSettled = this.resultSettledStatusIds.includes(halfTimeResult.resultStatusId);
    const isExistsHtSourceResult = externalResults.filter(e => this.sourceTypeIds.includes(e.sourceId)).flatMap(m => m.resultDetails)

    return isHalfTimeSettled || isExistsHtSourceResult.length > 0 || halfTimeResult.checked;
  }


  private setValueHalfTime(storage: CalculateBaseStorage) {
    const halfTimeResult = storage.getHalfTimeResult();
    halfTimeResult.homeValue = '0';
    halfTimeResult.awayValue = '0';
    halfTimeResult.checked = true;
    const screenshot = halfTimeResult.externalScores.find(x => x.sourceId === SourceIds.screenshot);
    if (screenshot) {
      screenshot.homeValue = '0';
      screenshot.awayValue = '0';
    }

  }
}