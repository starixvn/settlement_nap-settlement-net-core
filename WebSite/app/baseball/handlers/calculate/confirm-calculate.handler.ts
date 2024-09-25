
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { MatchDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResourceNamePipe } from "../../pipes/resource-name.pipe";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { Storage } from "../../services/storage.service";
import { isEqual } from "lodash";
import { InputType } from "../../constants/input-type.constant";
import { CalculateAction } from "../../../shared/constants";


export class ConfirmCalculateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  resultNamePipe = inject(ResourceNamePipe);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: Storage) {
    const message = storage.getActionSubmit() == CalculateAction.earlyCalculate 
        ? this.getConfirmEarly(storage.getResultChecked(), storage.getMatchDetail()) 
        : this.getConfirmMessage(storage.getResultChecked(), storage.getMatchDetail());

    this.notifyService.confirm(message, () => this.nextHandler.handle(storage));
  }

  private getConfirmMessage(resultDetails: ResultDetail[], matchDetail: MatchDetail) {
    let confirmMessage = `${Language.CalculationConfirmMessage}<br/>${Language.CalculationAdditionalConfirmation}<br/>`;
    resultDetails.forEach((x: ResultDetail) => {
      const resourceName = this.resultNamePipe.transform(x.resourceId,false,matchDetail.sessionTime);
      confirmMessage += `${resourceName}: ${x.homeValue} - ${x.awayValue}<br/>`;
    });
    return confirmMessage;
  }

  private getConfirmEarly(resultDetails: ResultDetail[], matchDetail: MatchDetail) {
    let confirmMessage = `${Language.CalculationConfirmMessageEarly}<br/>`;
    resultDetails.forEach((x: ResultDetail) => {
      let value = this.getValueBasedOnInputType(x, matchDetail);
      confirmMessage += `${x.betTypeName}: ${value}<br/>`;
    });

    return confirmMessage;
  }
  private getValueBasedOnInputType(resultDetail: ResultDetail, matchDetail: MatchDetail): string {
    switch (resultDetail.inputType) {
      case InputType.coupleScore:
        return `${resultDetail.homeValue} - ${resultDetail.awayValue}`;
      case InputType.homeAway:
        return this.getHomeAwayValue(resultDetail, matchDetail);
      default:
        return this.getYesNoValue(resultDetail);
    }
  }

  private getHomeAwayValue(resultDetail: ResultDetail, matchDetail: MatchDetail): string {
    if (isEqual(resultDetail.homeValue, "H")) {
      return matchDetail.homeName;
    }

    if (isEqual(resultDetail.homeValue, "A")) {
      return matchDetail.awayName;
    }

    return "Neither";

  }

  private getYesNoValue(resultDetail: ResultDetail): string {
    if (isEqual(resultDetail.homeValue, "Y")) {
      return "Yes";
    }

    if (isEqual(resultDetail.homeValue, "N")) {
      return "No";
    }

    return "";

  }
}