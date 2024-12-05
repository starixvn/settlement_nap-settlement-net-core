import { IRefundStorage } from './../../services/refund/refund.storage';
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { AioService } from "../../../shared/services";
import { ResourceItem, ResultSettingQuery } from '../../../shared/models';
import { HedgeMatchDetail } from "../../../shared/models/sportsbook-sop";
import { ResultSettingType } from '../../../shared/constants';
import * as _ from "lodash";

export class ConfirmRefundHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  #aioService = inject(AioService);
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: IRefundStorage) {
    if (storage.isSdtSettle()) {
      this.confirmRefundSettleDetermine(storage);
    } else if(storage.isMercy()) {
      this.confirmRefundMercy(storage);
    } else {
      this.confirmRefundNormal(storage);
    }
  }

  confirmRefundNormal(storage: IRefundStorage) {
    const match = storage.getMatch();
    const selectedResources = storage.getResultChecked();
    const resourceIds = selectedResources.map(item => item.resourceId).join(',');
    const hedgeMatch = storage.getApplyingHedgeMatch() ? match.hedgeMatchDetail : null;
   
    this.#aioService.changeConfirmResultSetting(
                Language.confirmRefund.confirmRefund,
                match.matchDetail.matchId, 
                resourceIds, 
                true,
                hedgeMatch,
                null,
                selectedResources);
  }

  confirmRefundSettleDetermine(storage: IRefundStorage) {
    const match = storage.getMatch();
    storage.addExtraInning();
    const selectedResources = storage.getResultChecked();
    selectedResources[0].otherInfo = storage.isAwayEnded() ? "" : "A";

    const hedgeMatch = storage.getApplyingHedgeMatch() ? match.hedgeMatchDetail : null;
    const resourceItems = selectedResources.map(item => new ResourceItem(item.resourceId, item.resourceName, item.homeValue, item.awayValue, item.otherInfo));
    this.#aioService.changeConfirmResultSDTSetting(match.matchDetail.matchId, ResultSettingType.confirmRefundSDT, resourceItems, true, hedgeMatch, false);
  }

  confirmRefundMercy(storage: IRefundStorage) {
    const match = storage.getMatch();
    const selectedResources = storage.getResultChecked();
    const hedgeMatch = storage.getApplyingHedgeMatch() ? match.hedgeMatchDetail : null;
    const resourceItems = selectedResources.map(item => new ResourceItem(item.resourceId, item.resourceName, item.homeValue, item.awayValue));
    const resourceIds = resourceItems.map(resource => resource.resourceId).join(',');
    this.notifyService.confirm(Language.confirmRefund.mercyConfirm, () => {
      const query = new ResultSettingQuery(match.matchDetail.matchId, ResultSettingType.confirmRefundMercy, true, resourceIds, resourceItems);
      this.#aioService.changeResultSetting(query).then(async () => {
          await this.confirmHedgeMatch(query, hedgeMatch);
      }).finally(() =>  this.notifyService.closePopup());
    });
  }

  private async confirmHedgeMatch(query: ResultSettingQuery, hedgeMatchDetail: HedgeMatchDetail) {
    if (!_.isNil(hedgeMatchDetail) && hedgeMatchDetail.matchId > 0) {
      query.matchId = hedgeMatchDetail.matchId;
      await this.#aioService.changeResultSetting(query);
    } 
  }
}