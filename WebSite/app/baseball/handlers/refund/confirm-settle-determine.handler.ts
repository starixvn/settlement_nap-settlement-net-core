import { IRefundStorage } from './../../services/refund/refund.storage';
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { SettlementStatusId, ResourceIds } from "../../../shared/constants";
import * as _ from "lodash";

export class ConfirmSettleDetermineHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: IRefundStorage) {
    if (storage.isSdtSettle()) {
      this.validateSettleDetermine(storage);
    } else {
      this.nextHandler.handle(storage);
    }
  }

  private validateSettleDetermine(storage: IRefundStorage) {
    const resultDetails = storage.getResultDetails().filter(x => x.resourceId !== ResourceIds.totalHits);
    const selectedResources = storage.getResultChecked();
    const firstSelectedResourceIndex = resultDetails.indexOf(selectedResources[0]);
    
    if (this.validateAwayEnded(storage, selectedResources[0]) || this.validateAwayNotEnded(storage, selectedResources[0]) ) {
      this.notifyService.error(Language.warningInputScore);
    } else if (this.validateResourcePreviousToFirstSelected(firstSelectedResourceIndex, resultDetails)
    || this.validateResourceNextToFirstSelected(firstSelectedResourceIndex, resultDetails)) {
      this.notifyService.error(Language.confirmRefund.sdtErrorMessage);
    } else {
      this.nextHandler.handle(storage);
    }    
  }

  private validateAwayEnded(storage: IRefundStorage, firstResource: ResultDetail) {
    const isFirstResourceEmpty = _.isEmpty(firstResource.awayValue) || _.isEmpty(firstResource.homeValue);
    return storage.isAwayEnded() && isFirstResourceEmpty;
  }

  private validateAwayNotEnded(storage: IRefundStorage, firstResource: ResultDetail) {
    const isFirstResourceEmpty = _.isEmpty(firstResource.awayValue) || _.isEmpty(firstResource.homeValue);
    return !storage.isAwayEnded() && (isFirstResourceEmpty || Number(firstResource.homeValue) !==0);
  }
  private validateResourcePreviousToFirstSelected(firstResourceIndex: number, resultDetails: ResultDetail[]) {
    const resultDetailBefore = resultDetails.slice(0, firstResourceIndex);
    return resultDetailBefore.some(resource => resource.settlementStatusId !== SettlementStatusId.Calculated);
  }

  private validateResourceNextToFirstSelected(firstResourceIndex: number, resultDetails: ResultDetail[]) {
    const resultDetailAfter = resultDetails.slice(firstResourceIndex + 1);
    const isExistValueNotEmptyAfter = resultDetailAfter.some(resource => !_.isEmpty(resource.awayValue) || !_.isEmpty(resource.homeValue));
    const isExistValueNotCheckedAfter = resultDetailAfter.some(resource => !resource.checked);
    return isExistValueNotCheckedAfter || isExistValueNotEmptyAfter;
  }

}