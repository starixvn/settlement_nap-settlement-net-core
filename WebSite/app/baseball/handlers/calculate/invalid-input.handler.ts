import { find, isEmpty, isNil } from "lodash";
import { Language } from "../../../shared/language.native";
import { NotifyService } from "../../services/notify.service";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResourceIds } from "../../constants/resource-id.constant";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Storage } from "../../services/storage.service";
import { ResultRowStateService } from "../../services/result-row-state.service";

export class InvalidInputHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);
  private readonly resultRowState = inject(ResultRowStateService)


  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: Storage) {
    if (this.invalidInputScore(storage.getResultChecked())) {
      storage.setResultsCheckedState(this.resultRowState);
      this.notifyService.error(storage.isLeader() ? Language.sop.leader.blankScore : Language.sop.nonLeader.blankScore);
    } else {
      this.nextHandler.handle(storage);
    }
  }

  private invalidInputScore(resultDetails: ResultDetail[]) {
    const findMap = find(resultDetails, item => (isEmpty(item.homeValue) || isEmpty(item.awayValue)) && item.resourceId !== ResourceIds.fullTime && item.resourceId !== ResourceIds.extraInning);
    const findEi = find(resultDetails, item => (isEmpty(item.homeValue) === isEmpty(item.awayValue)) && item.resourceId === ResourceIds.extraInning);
    const final = find(resultDetails, item => (isEmpty(item.homeValue) || isEmpty(item.awayValue))
      && item.resourceId === ResourceIds.fullTime);
    

    return !isNil(findMap) || !isNil(final) || !findEi;
  }
}