import { Storage } from './../../services/storage.service';
import { find, isEqual } from "lodash";
import { Language } from "../../../shared/language.native";
import { ResourceIds } from "../../constants/resource-id.constant";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";

export class ResultConfirmedHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: Storage) {
    const existResultConfirmed = find(
      storage.getResultChecked(), 
      (item) =>item.resultSettingData.isConfirmedRefund && !isEqual(item.resourceId, ResourceIds.extraInning)
    );
    if (existResultConfirmed) {
      this.notifyService.error(Language.confirmRefund.calculateResultNotConfirmed);
    } else {
      this.nextHandler.handle(storage);
    }
}
}