import { IRefundStorage } from './../../services/refund/refund.storage';
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { SettlementStatusId } from "../../../shared/constants";
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
    const resultDetails = storage.getResultDetails();
    const selectedResources = storage.getResultChecked();
    const firstSelectedResourceIndex = resultDetails.indexOf(selectedResources[0]);
    const isFirstResourceEmpty = _.isEmpty(selectedResources[0].awayValue) || _.isEmpty(selectedResources[0].homeValue);

    if (isFirstResourceEmpty) {
      this.notifyService.error(Language.warningInputScore);
    } else if (this.validateResourceBeforeFirstSelected(firstSelectedResourceIndex, resultDetails)
    || this.validateResourceAfterFirstSelected(firstSelectedResourceIndex, resultDetails)) {
      this.notifyService.error(Language.confirmRefund.sdtErrorMessage);
    } else {
      this.nextHandler.handle(storage);
    }    
  }

  private validateResourceBeforeFirstSelected(firstResourceIndex: number, resultDetails: ResultDetail[]) {
    const resultDetailBefore = resultDetails.slice(0, firstResourceIndex);
    return resultDetailBefore.some(resource => resource.settlementStatusId !== SettlementStatusId.Calculated);
  }

  private validateResourceAfterFirstSelected(firstResourceIndex: number, resultDetails: ResultDetail[]) {
    const resultDetailAfter = resultDetails.slice(firstResourceIndex + 1);
    const isExistValueNotEmptyAfter = resultDetailAfter.some(resource => !_.isEmpty(resource.awayValue) || !_.isEmpty(resource.homeValue));
    const isExistValueNotCheckedAfter = resultDetailAfter.some(resource => !resource.checked);
    return isExistValueNotCheckedAfter || isExistValueNotEmptyAfter;
  }

}