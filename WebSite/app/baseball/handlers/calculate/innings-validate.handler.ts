import { isEmpty, findLast, isEqual } from "lodash";
import { Language } from "../../../shared/language.native";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { ResourceIds, SettlementStatusId } from '../../../shared/constants';
import { ICalculateStorage } from "../../services/calculate/calculate.storage";

export class InningsValidateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: ICalculateStorage) {
    const resultChecked = storage.getResultChecked();
    const allInnings = storage.getInningsExcludeExtraAndTotalHits();
    const last =findLast(resultChecked);
    const previousInnings = allInnings.filter((x) => x.resourceId < last.resourceId);
    const inningsRunning = previousInnings.filter((x) => !x.checked 
                          && (x.settlementStatusId === SettlementStatusId.Running || x.settlementStatusId === SettlementStatusId.Refund));    
    const isOnlyTotalHits = resultChecked.length === 1 && isEqual(last.resourceId, ResourceIds.totalHits);
    if (isEmpty(inningsRunning) || isOnlyTotalHits) {
      this.nextHandler.handle(storage);
    } else {
      storage.setResultsWarningState(inningsRunning);
      this.notifyService.error(Language.intervalsAndMatch.inningsNotSelected);
    }
  }
}