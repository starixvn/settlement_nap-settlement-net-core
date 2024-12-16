import { Storage } from './../../services/storage.service';
import { isEmpty, isEqual, includes } from "lodash";
import { Language } from "../../../shared/language.native";
import { ResourceIds } from "../../../shared/constants";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { SettlementStatusId } from '../../../shared/constants';
export class MultiMercyValidateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: Storage) {
    const resultDetails = storage.getResultDetails().filter(x => !isEqual(x.resourceId, ResourceIds.totalHits));
    const resultDetailsExistedMercy = resultDetails.filter((item) => !isEmpty(item.otherInfo) && isEqual(item.otherInfo.toLowerCase(), ResourceIds.mercy.toLowerCase()));
    
    if (resultDetailsExistedMercy.length > 1) {
      if (storage.isLeader()) {
        this.notifyService.confirm(Language.mercy.multipleMercyConfirm, () => this.nextHandler.handle(storage));
      } else {
        this.notifyService.error(Language.mercy.multipleMercy);
      }
    } else {
      this.nextHandler.handle(storage);
    }  
  }
}