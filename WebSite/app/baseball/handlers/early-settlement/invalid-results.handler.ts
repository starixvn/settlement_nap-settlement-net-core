import { isEmpty } from "lodash";
import { Language } from "../../../shared/language.native";
import { NotifyService } from "../../services/notify.service";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Storage } from "../../services/storage.service";
import { InputType } from "../../constants/input-type.constant";

export class InvalidResultsHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: Storage) {
    if (this.invalidInputScore(storage.getResultChecked())) {
      this.notifyService.error(storage.isLeader() ? Language.sop.leader.blankResult : Language.sop.nonLeader.blankResult);
    } else {
      this.nextHandler.handle(storage);
    }
  }

  private invalidInputScore(resultDetails: ResultDetail[]) {
    resultDetails.forEach((item: ResultDetail) => {
      item.isResultWarning = this.isEmptyResultValue(item);
    });
    return resultDetails.some((item: ResultDetail) => item.isResultWarning);
  }

  private isEmptyResultValue(resultDetail: ResultDetail): boolean {
    if(resultDetail.inputType === InputType.coupleScore) {
      return isEmpty(resultDetail.homeValue) || isEmpty(resultDetail.awayValue);
    }

    return isEmpty(resultDetail.homeValue);
  }
}