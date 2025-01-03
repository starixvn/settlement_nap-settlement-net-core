import * as _ from "lodash";
import { IRefundStorage } from './../../services/refund/refund.storage';
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { SettlementStatusId, ResourceIds } from "../../../shared/constants";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";

export class ConfirmMercyHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: IRefundStorage) {
    if (storage.isMercy()) {
      this.validateMercy(storage);
    } else {
      this.nextHandler.handle(storage);
    }
  }
  
  private validateMercy(storage: IRefundStorage) {
    const resultDetails = storage.getResultDetails().filter(x => !_.includes([ResourceIds.totalHits, ResourceIds.fullTime, ResourceIds.extraInning], x.resourceId));
    const selectedResources = storage.getResultChecked();
    const firstSelectedResourceIndex = resultDetails.indexOf(selectedResources[0]);

    if (this.validateResourcePreviousToFirstSelected(firstSelectedResourceIndex, resultDetails)) {
      this.notifyService.error(Language.confirmRefund.sdtErrorMessage);
    } else if(this.validateResourceNextToFirstSelected(firstSelectedResourceIndex, resultDetails)) {
      this.notifyService.error(Language.confirmRefund.subsequenceIntervalsErrorMessage);
    } else if(this.validateResourceNextToFirstNotEmptyScore(firstSelectedResourceIndex, resultDetails)) {
      this.notifyService.error(Language.sop.invalidResultByBetType);
    } else {
      this.nextHandler.handle(storage);
    }    
  }

  private validateResourcePreviousToFirstSelected(firstResourceIndex: number, resultDetails: ResultDetail[]) {
    const resultDetailBefore = resultDetails.slice(0, firstResourceIndex);
    return resultDetailBefore.some(resource => resource.settlementStatusId !== SettlementStatusId.Calculated);
  }

  private validateResourceNextToFirstNotEmptyScore(firstResourceIndex: number, resultDetails: ResultDetail[]) {
    const resultDetailAfter = resultDetails.slice(firstResourceIndex);
    return resultDetailAfter.some(resource => !_.isEmpty(resource.awayValue) || !_.isEmpty(resource.homeValue));
  }

  private validateResourceNextToFirstSelected(firstResourceIndex: number, resultDetails: ResultDetail[]) {
    const resultDetailAfter = resultDetails.slice(firstResourceIndex + 1);
    return resultDetailAfter.some(resource => !resource.checked && !_.isEqual(resource.resourceId, ResourceIds.extraInning));
  }
}