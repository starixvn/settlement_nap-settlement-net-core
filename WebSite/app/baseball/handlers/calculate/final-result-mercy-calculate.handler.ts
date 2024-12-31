import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { ResourceNamePipe } from "../../pipes/resource-name.pipe";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { ResourceIds, SettlementStatusId } from "../../../shared/constants";
import { isEmpty, isEqual } from "lodash";
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
    const mercyIndex = allInnings.findIndex(item=> !item.checked && item.settlementStatusId !== SettlementStatusId.Calculated && !isEmpty(item.otherInfo) && isEqual(item.otherInfo.toLowerCase(), ResourceIds.mercy.toLowerCase()));
   
    if (mercyIndex === -1) {
      this.nextHandler.handle(storage);
      return;
    }
  
    const allInningsExcludeTotalHits = storage.getResultDetails().filter((item) => !isEqual(item.resourceId, ResourceIds.totalHits));
    const lastSelectedIndex = allInningsExcludeTotalHits.findLastIndex(item=>  item.resourceId !== ResourceIds.totalHits && item.checked);

    if (storage.isLeader() && lastSelectedIndex > mercyIndex) {
      this.notifyService.confirm(Language.intervalsAndMatch.intervalNotSelectedOrNotCalculated, () => this.nextHandler.handle(storage));
      return;
    } 

    if (lastSelectedIndex > mercyIndex) {
      this.notifyService.error(Language.intervalsAndMatch.inningsNotSelected);
    }
    else {
      this.nextHandler.handle(storage);
    }
  }
}
