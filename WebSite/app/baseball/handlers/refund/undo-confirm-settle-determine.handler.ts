import * as _ from "lodash";
import { IRefundStorage } from './../../services/refund/refund.storage';
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { AioService } from "../../../shared/services";
import { ResourceItem } from '../../../shared/models';
import { Language } from "../../../shared/language.native";
import { ResultDetail, HedgeMatchDetail } from "../../../shared/models/sportsbook-sop";
import { ResourceIds, ResultSettingType } from "../../../shared/constants";
import { NotifyService } from "../../services/notify.service";

export class UndoConfirmSettleDetermineHandler implements BaseHandler {
  #aioService = inject(AioService);
  private readonly notifyService = inject(NotifyService);
  setNextHandler() {}

  handle(storage: IRefundStorage) {
    if (storage.isMercy() && storage.isSdtSettle()) {
      this.notifyService.error(Language.sop.inning.SdtAndMercySelected);
      return;
    }

    const match = storage.getMatch();
    const hedgeMatch = storage.getApplyingHedgeMatch() ? match.hedgeMatchDetail : null;
    const resultDetails = storage.getResultDetails();
    const refundNormal = resultDetails.filter(item => item.resultSettingData.isConfirmedRefund);
    
    if (refundNormal.length > 0) {
      this.undoConfirmNormal(match.matchDetail.matchId, refundNormal, hedgeMatch);
    } else {
      this.undoConfirmSdtOrMercy(match.matchDetail.matchId, resultDetails, hedgeMatch);
    }
  }

  private undoConfirmNormal(matchId: number, resultDetails: ResultDetail[], hedgeMatch: HedgeMatchDetail) {
    const resourceIds = resultDetails.map(resource => resource.resourceId).join(',');
    this.#aioService.changeConfirmResultSetting(Language.confirmRefund.undoConfirmAll, matchId, resourceIds, false, hedgeMatch, null, []);
  }

  private undoConfirmSdtOrMercy(matchId: number, resultDetails: ResultDetail[], hedgeMatch: HedgeMatchDetail) {
    var settingType: number;
    var resultConfirmed: ResultDetail[];
    
    var hasConfirmedSdt = resultDetails.some(item => item.resultSettingData.isConfirmedRefundSdt && item.resourceId !== ResourceIds.totalHits);

    if (hasConfirmedSdt) {
      settingType = ResultSettingType.confirmRefundSDT;
      resultConfirmed = resultDetails.filter(item => item.resultSettingData.isConfirmedRefundSdt && item.resourceId !== ResourceIds.totalHits);
    } else {
      settingType = ResultSettingType.confirmRefundMercy;
      resultConfirmed = resultDetails.filter(item => item.resultSettingData.isConfirmedRefundMercy && !_.includes([ResourceIds.totalHits, ResourceIds.fullTime], item.resourceId));
    }

    const resourceItems = resultConfirmed.map(item => new ResourceItem(item.resourceId, item.resourceName, item.homeValue, item.awayValue))
    this.#aioService.changeConfirmResultSDTSetting(matchId, settingType, resourceItems, false, hedgeMatch);
  }
}