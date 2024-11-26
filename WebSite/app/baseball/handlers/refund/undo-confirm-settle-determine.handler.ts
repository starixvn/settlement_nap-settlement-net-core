import { IRefundStorage } from './../../services/refund/refund.storage';
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { AioService } from "../../../shared/services";
import { ResourceItem } from '../../../shared/models';

export class UndoConfirmSettleDetermineHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  #aioService = inject(AioService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: IRefundStorage) {
    if (storage.isSdtSettle()) {
      this.undoConfirm(storage);
    } else {
      this.nextHandler.handle(storage);
    }
  }

  private undoConfirm(storage: IRefundStorage) {
    const match = storage.getMatch();
    const hedgeMatch = storage.getApplyingHedgeMatch() ? match.hedgeMatchDetail : null;
    const resultDetails = storage.getResultDetails();
    const resultConfirmed = resultDetails.filter(item => item.resultSettingData.isConfirmedRefundSdt)
    const resourceItems = resultConfirmed.map(item => new ResourceItem(item.resourceId, item.resourceName, item.homeValue, item.awayValue))
    this.#aioService.changeConfirmResultSDTSetting(match.matchDetail.matchId, resourceItems, false, hedgeMatch);
  }
}