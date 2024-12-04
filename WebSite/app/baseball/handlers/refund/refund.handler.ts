import * as _ from "lodash";
import { IRefundStorage } from './../../services/refund/refund.storage';
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { BaseballApiKeys} from "../../constants/api-keys.constant";
import { AioService } from "../../../shared/services";
import { SettleChildMatchQuery, Result} from "../../../shared/models";
import { ExternalResultDetail, HedgeMatchDetail, MatchDetail, Permission, ResultDetail, SettleQuery } from "../../../shared/models/sportsbook-sop";
import { CalculateAction, ResourceIds, SettlementStatusId, SportType, ResultSettingType } from "../../../shared/constants";

export class RefundHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  #aioService = inject(AioService);
  #notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(storage: IRefundStorage) {
    if (storage.isSdtSettle()) {
      await this.refundSettleDetermine(storage);
    } else if(storage.isMercy()) {
      await this.refundMercy(storage);
    } else {
      await this.refundNormal(storage);
    }
  }

  async refundSettleDetermine(storage: IRefundStorage) {
    const match = storage.getMatch();
    storage.addExtraInning();
    const selectedResources = storage.getResultChecked();
    selectedResources[0].otherInfo = storage.isAwayEnded() ? "" : "A";
    const hedgeMatch = storage.getApplyingHedgeMatch() ? match.hedgeMatchDetail : null;

    this.#notifyService.confirm(Language.RefundConfirmSdtMessage, async () => {
      const query = new SettleQuery(match.matchDetail, selectedResources, CalculateAction.refund, false, "", BaseballApiKeys.Settle);
      query.determinedType = this.generateDeterminedType(selectedResources);
        
      const result = await this.#aioService.push(query);
      if (result.isSuccessful) {
        result.childMatchIds && await this.childMatch(result, selectedResources);
        await this.hedgeMatch(query, hedgeMatch);
      } else {
        this.#notifyService.error(result.errMsg);
      }
    });
  }

  async refundMercy(storage: IRefundStorage) {
    const match = storage.getMatch();
    const selectedResources = storage.getResultChecked();
    selectedResources[0].otherInfo = "Mercy";
    const hedgeMatch = storage.getApplyingHedgeMatch() ? match.hedgeMatchDetail : null;

    this.#notifyService.confirm(Language.RefundConfirmMercyMessage, async () => {
      const query = new SettleQuery(match.matchDetail, selectedResources, CalculateAction.refund, false, "", BaseballApiKeys.Settle);
      query.determinedType = this.generateDeterminedType(selectedResources);
        
      const result = await this.#aioService.push(query);
      if (result.isSuccessful) {
        result.childMatchIds && await this.childMatch(result, selectedResources);
        await this.hedgeMatch(query, hedgeMatch);
      } else {
        this.#notifyService.error(result.errMsg);
      }
    });
  }

  generateDeterminedType(resultDetails: ResultDetail[]) {
    const roundBitStartAt = 2;
    const bitArray = new Array<number>(12).fill(0);
    const resultWithoutFinal = resultDetails
      .filter(resultDetail => resultDetail.resourceId !== ResourceIds.fullTime);

      resultWithoutFinal.forEach(resultDetail => {
        var pos = _.isEqual(resultDetail.resourceId, ResourceIds.extraInning) 
                ? 10 
                : Number(resultDetail.resourceId.slice(-2));
         
        const bitPosition = pos + roundBitStartAt;
        bitArray[bitPosition] = 1;
      });

    const reversedBitArray = bitArray.toReversed();
    return parseInt(reversedBitArray.join(''), 2);
  }

  async refundNormal(storage: IRefundStorage) {
    const match = storage.getMatch();
    const selectedResources = storage.getResultChecked();
    const hedgeMatch = storage.getApplyingHedgeMatch() ? match.hedgeMatchDetail : null;
    selectedResources.forEach((item) => {
      item.homeValue = "";
      item.awayValue = "";
    });

    this.#notifyService.confirm(Language.RefundConfirmMessage, async () => {
      const query = new SettleQuery(match.matchDetail, selectedResources, CalculateAction.refund, false, "", BaseballApiKeys.Settle);
      const result = await this.#aioService.push(query);
      if (result.isSuccessful) {
        result.childMatchIds && await this.childMatch(result, selectedResources);
        await this.hedgeMatch(query, hedgeMatch);
      } else {
        this.#notifyService.error(result.errMsg);
      }
    });
  }

  private async childMatch(result: Result, selectedResources: ResultDetail[]) {
    const settleChildMatchQuery = new SettleChildMatchQuery(result.childMatchIds, selectedResources, CalculateAction.refund, false);
    settleChildMatchQuery.sportType = SportType.baseBall;
    settleChildMatchQuery.parentSessionId = result.settledSessionId;

    await this.#aioService.pushChildMatch(settleChildMatchQuery);
  }

  private async hedgeMatch(query: SettleQuery, hedgeMatchDetail: HedgeMatchDetail) {
    if (!_.isNil(hedgeMatchDetail) && hedgeMatchDetail.matchId > 0) {
      query.matchId = hedgeMatchDetail.matchId;
      await this.#aioService.push(query);
    } 

    this.#notifyService.closePopup();
  }
}