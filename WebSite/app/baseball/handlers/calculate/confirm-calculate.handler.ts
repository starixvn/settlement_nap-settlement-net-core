
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
    const message = storage.getActionSubmit() == CalculateAction.earlyCalculate ?
      this.getConfirmEarly(storage.getResultChecked(), storage.getMatchDetail()) : this.getConfirmMessage(storage.getResultChecked());
    this.notifyService.confirm(message, () => {
      this.nextHandler.handle(storage);
    });
  }

  private getConfirmMessage(resultDetails: ResultDetail[]) {
    let confirmMessage = `${Language.CalculationConfirmMessage}<br/>${Language.CalculationAdditionalConfirmation}<br/>`;
    resultDetails.forEach((x: ResultDetail) => {
      const resourceName = this.resultNamePipe.transform(x.resourceId);
      confirmMessage += `${resourceName}: ${x.homeValue} - ${x.awayValue}<br/>`;
    });
    return confirmMessage;
  }

  private getConfirmEarly(resultDetails: ResultDetail[], matchDetail: MatchDetail) {
    let confirmMessage = `${Language.CalculationConfirmMessageEarly}<br/>`;
    resultDetails.forEach((x: ResultDetail) => {
      let value = '';
      if (x.inputType === InputType.coupleScore) {
        value = `${x.homeValue} - ${x.awayValue}`;
      } else {
        value = isEqual(x.homeValue, "H") ? matchDetail.homeName :
          isEqual(x.homeValue, "A") ? matchDetail.awayName : "Neither";
      }
      confirmMessage += `${x.betTypeName}: ${value}<br/>`;
    });

    return confirmMessage;
  }
}