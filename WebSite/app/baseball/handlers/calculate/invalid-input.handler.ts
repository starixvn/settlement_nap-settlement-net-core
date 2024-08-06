import { find, isEmpty, isNil } from "lodash";
import { Language } from "../../../shared/language.native";
import { CalculateStorage } from "../../services/calculate/calculate.storage";
import { NotifyService } from "../../services/notify.service";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResourceIds } from "../../constants/resource-id.constant";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Storage } from "../../services/storage.service";

export class InvalidInputHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: Storage) {
    if (this.invalidInputScore(storage.getResultChecked())) {
      this.notifyService.error(storage.isLeader() ? Language.sop.leader.blankScore : Language.sop.nonLeader.blankScore);
    } else {
      this.nextHandler.handle(storage);
    }
  }

  private invalidInputScore(resultDetails: ResultDetail[]) {
    const findMap = find(resultDetails, item => isEmpty(item.homeValue) && item.resourceId !== ResourceIds.fullTime && item.resourceId !== ResourceIds.extraInning);
    const final = find(resultDetails, item => (isEmpty(item.homeValue) || isEmpty(item.awayValue))
      && item.resourceId === ResourceIds.fullTime);

    return !isNil(findMap) || !isNil(final);
  }
}