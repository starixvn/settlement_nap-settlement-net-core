import { find, isEmpty, isNil } from "lodash";
import { Language } from "../../../shared/language.native";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResourceIds } from "../../constants/resource-id.constant";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";

export class InvalidInputHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle() {
    if (this.invalidInputScore(this.store.getResultChecked())) {
      this.notifyService.error(this.store.isLeader() ? Language.sop.leader.blankScore : Language.sop.nonLeader.blankScore);
    } else {
      this.nextHandler.handle();
    }
  }

  private invalidInputScore(resultDetails: ResultDetail[]) {
    const findMap = find(resultDetails, item => isEmpty(item.homeValue) && item.resourceId !== ResourceIds.fullTime);
    const final = find(resultDetails, item => (isEmpty(item.homeValue) || isEmpty(item.awayValue))
      && item.resourceId === ResourceIds.fullTime);

    return !isNil(findMap) || !isNil(final);
  }
}