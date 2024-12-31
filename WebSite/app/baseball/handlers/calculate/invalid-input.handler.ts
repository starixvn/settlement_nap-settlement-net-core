import { find, isEmpty, isNil, isEqual } from "lodash";
import { Language } from "../../../shared/language.native";
import { NotifyService } from "../../services/notify.service";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResourceIds } from "../../../shared/constants/resource-id.native";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { ICalculateStorage } from "../../services/calculate/calculate.storage";
import { ResultRowStateService } from "../../services/result-row-state.service";

export class InvalidInputHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);
  private readonly resultRowState = inject(ResultRowStateService)


  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: ICalculateStorage) {
    const isExistedMercy = storage.getInningsExcludeExtraAndTotalHits().some(item=> !isEmpty(item.otherInfo) && isEqual(item.otherInfo.toLowerCase(), ResourceIds.mercy.toLowerCase()));
    
    if ((!isExistedMercy|| storage.isLeader()) && this.invalidInputScore(storage.getResultChecked())) {
      storage.setResultsCheckedState(this.resultRowState);
      this.notifyService.error(storage.isLeader() ? Language.sop.leader.blankScore : Language.sop.nonLeader.blankScore);
    } else {
      this.nextHandler.handle(storage);
    }
  }

  private invalidInputScore(resultDetails: ResultDetail[]) {
    const findMap = find(resultDetails, item => (isEmpty(item.homeValue) || isEmpty(item.awayValue)) && item.resourceId !== ResourceIds.fullTime && item.resourceId !== ResourceIds.extraInning);
    const findEi = find(resultDetails, item => item.resourceId === ResourceIds.extraInning);
    const final = find(resultDetails, item => (isEmpty(item.homeValue) || isEmpty(item.awayValue))
      && item.resourceId === ResourceIds.fullTime);
    

    return !isNil(findMap) || !isNil(final) || (findEi && (isEmpty(findEi.homeValue) !== isEmpty(findEi.awayValue)));
  }
}