import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { ResourceNamePipe } from "../../pipes/resource-name.pipe";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { ResourceIds, SettlementStatusId } from "../../../shared/constants";
import * as _ from "lodash";
import { ICalculateStorage } from "../../services/calculate/calculate.storage";
export class FinalResultMercyCalculateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  resultNamePipe = inject(ResourceNamePipe);
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: ICalculateStorage) {
    const allInnings = storage.getInningsExcludeExtraAndTotalHits();
    const mercyResult = allInnings.find(item=> !item.checked && item.settlementStatusId !== SettlementStatusId.Calculated && !_.isEmpty(item.otherInfo) && _.isEqual(item.otherInfo.toLowerCase(), ResourceIds.mercy.toLowerCase()));
    if (mercyResult) {
      if (storage.isLeader()) {
        this.notifyService.confirm(Language.intervalsAndMatch.intervalNotSelectedOrNotCalculated, () => this.nextHandler.handle(storage));
        return;
      } 
      
      const lastSelected = _.findLast(storage.getResultChecked().filter(item=>  item.resourceId !== ResourceIds.totalHits));
      if (lastSelected.resourceId < mercyResult.resourceId) {
        this.nextHandler.handle(storage);
      }
      else {
        this.notifyService.error(Language.intervalsAndMatch.inningsNotSelected);
      }
    } else {
      this.nextHandler.handle(storage);
    }
  }
}
