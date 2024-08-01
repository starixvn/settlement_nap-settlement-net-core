import { Store } from './../../services/store.service';
import { find, isEqual } from "lodash";
import { Language } from "../../../shared/language.native";
import { ResourceIds } from "../../constants/resource-id.constant";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";

export class ResultConfirmedHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(store: Store) {
    const existResultConfirmed = find(
      store.getResultChecked(), 
      (item) =>item.resultSettingData.isConfirmedRefund && !isEqual(item.resourceId, ResourceIds.extraInning)
    );
    if (existResultConfirmed) {
      this.notifyService.error(Language.confirmRefund.calculateResultNotConfirmed);
    } else {
      this.nextHandler.handle(store);
    }
}
}