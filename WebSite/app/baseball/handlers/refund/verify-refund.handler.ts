import * as _ from "lodash";
import { IRefundStorage } from './../../services/refund/refund.storage';
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { AioService } from "../../../shared/services";
import { Language } from "../../../shared/language.native";

export class VerifyRefundHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  #aioService = inject(AioService);
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(storage: IRefundStorage) {
    if(this.existResultNotConfirmedNormal(storage)) {
      this.notifyService.error(Language.confirmRefund.refundResultNotConfirmed);
    } else if (this.inconsistencyBetweenConfirmAndRefund(storage) || this.isMisMatchSettleDetermine(storage) || this.isMisMatchMercy(storage)) {
      this.notifyService.error(Language.confirmRefund.sdtErrorMessage);
    } else if(await this.isExistMarkedTicket(storage)) {
      this.notifyService.error(Language.MarkedTicket);
    } else {
      this.nextHandler.handle(storage);
    }
  }

  inconsistencyBetweenConfirmAndRefund(storage: IRefundStorage) {
    const isMisMatchSelected = storage.getResultChecked().length !== storage.getExternalResults().length;
    return this.isSettleSdtOrMercy(storage) && isMisMatchSelected;
  }

  isMisMatchMercy(storage: IRefundStorage) {
    const isMisMatch =  !storage.getResultChecked().every(result => {
      const resource = storage.getExternalResults().find(x => x.resourceId === result.resourceId);
      return !_.isUndefined(resource) && result.resultSettingData.isConfirmedRefundMercy
          && _.isEqual(result.homeValue, resource.homeValue)
          && _.isEqual(result.awayValue, resource.awayValue)
    });
    
    return storage.isMercy() && isMisMatch;
  }

  isMisMatchSettleDetermine(storage: IRefundStorage) {
    const isMisMatch =  !storage.getResultChecked().every(result => {
      const resource = storage.getExternalResults().find(x => x.resourceId === result.resourceId);
      return !_.isUndefined(resource) && result.resultSettingData.isConfirmedRefundSdt
          && _.isEqual(result.homeValue, resource.homeValue)
          && _.isEqual(result.awayValue, resource.awayValue)
    });
    
    return storage.isSdtSettle() && (isMisMatch || this.inconsistencyAwayEnd(storage));
  }

  inconsistencyAwayEnd(storage: IRefundStorage) {
    const flag = storage.getExternalResults().some((item) => !_.isEmpty(item.otherInfo) && _.isEqual(item.otherInfo.toLowerCase(), "a"))
    return storage.isAwayEnded() === flag;
  }

  existResultNotConfirmedNormal(storage: IRefundStorage) {
    return !this.isSettleSdtOrMercy(storage) &&  _.some(storage.getResultChecked(), item => !item.resultSettingData.isConfirmedRefund);
  }

  isSettleSdtOrMercy = (storage: IRefundStorage) => storage.getResultChecked().some(item => item.resultSettingData.isConfirmedRefundSdt || item.resultSettingData.isConfirmedRefundMercy);
  

  async isExistMarkedTicket(storage: IRefundStorage) {
    const paramsCheckingMarkedTickets = {
      matchId: storage.getMatchDetail().matchId,
      selectedResources: storage.getResultChecked()
    };

    const res = await this.#aioService.checkMarkedTickets(paramsCheckingMarkedTickets);
    return res.isExistMarkedTicket
  } 
}