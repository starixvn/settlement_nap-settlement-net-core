import { Storage } from './../../services/storage.service';
import { isEmpty, findLast } from "lodash";
import { Language } from "../../../shared/language.native";
import { ResourceIds } from "../../constants/resource-id.constant";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { SettlementStatusId } from '../../../shared/constants';

export class InningsValidateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: Storage) {
    const allInnings = storage
      .getResultDetails()
      .filter((x) =>
        ![
          ResourceIds.totalHits,
          ResourceIds.fullTime,
          ResourceIds.extraInning,
        ].includes(x.resourceId)
      );
    const last =findLast(storage.getResultChecked());
    const previousInnings = allInnings.filter((x) => x.resourceId < last.resourceId);
    const inningsRunning = previousInnings.filter((x) => !x.checked 
                          && (x.settlementStatusId === SettlementStatusId.Running || x.settlementStatusId === SettlementStatusId.Refund));    
    if (isEmpty(inningsRunning)) {
      this.nextHandler.handle(storage);
    } else {
      storage.setResultsWarningState(inningsRunning);
      this.notifyService.error(Language.intervalsAndMatch.inningsNotSelected);
    }
  }
}