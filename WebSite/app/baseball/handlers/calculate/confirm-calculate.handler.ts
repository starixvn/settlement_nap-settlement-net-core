import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResourceIds } from "../../constants/resource-id.constant";
import { ResourceNamePipe } from "../../pipes/resource-name.pipe";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { CalculateStore } from "../../services/calculate/calculate.store";


export class ConfirmCalculateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  resultNamePipe = inject(ResourceNamePipe);
  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle() {
    const message = this.getConfirmMessage(this.store.getResultChecked());
    this.notifyService.confirm(message, () => {
        this.nextHandler.handle();
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
}