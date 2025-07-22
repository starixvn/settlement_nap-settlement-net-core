import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { CalculateAction, SettlementStatusId } from '../../../../shared/constants';
import { Language } from "../../../../shared/language.native";
import { ResultDetail } from "../../../models";
import { LogicService } from "../../../components/sop-refund/services/logic.service";
import { inject } from "@angular/core";
import { RefundType } from "../../../constants";
import { MatchDetail } from "../../../components/sop-refund/models/match.model";

export class VerifyScoreHandler extends AbstractHandler {
  #logicService = inject(LogicService);
  public handle(storage: RefundBaseStorage): void {
    const { matchDetail } = storage.getMatch();
    const actions = [CalculateAction.refundHalfTime, CalculateAction.refundFullTime, CalculateAction.refund];
    const action = this.#logicService.getActionName();
    const actionBlocked = this.#logicService.setDisableRefund(matchDetail);
    const actionIndex = actions.indexOf(action);
    if(actionBlocked[actionIndex]){
      storage.error(Language.confirmRefund.differentAction);
      return;
    }

    const isBlocked = this.verifyRefundSdtStatus(action, storage.getHalfTimeResult(), storage.getFullTimeResult(), matchDetail);
    if(isBlocked){
      storage.error(Language.confirmRefund.differentAction);
      return;
    }

    if (matchDetail.isSettleDetermined) {
      const scoreChanged = this.scoreChanged(storage);
      if (scoreChanged) {
        storage.error(Language.confirmRefund.scoreChanged);
        return;
      }
    } 
    super.handle(storage);
  }

  private verifyRefundSdtStatus(action: string, haftTime: ResultDetail, fulltime: ResultDetail, matchDetail: MatchDetail) {
    let disableAction = "";
    if(action === CalculateAction.refund){
      disableAction = this.#logicService.setDisableSubRefundAll(haftTime.settlementStatusId, fulltime.settlementStatusId);
    }

    if(action === CalculateAction.refundFullTime){
      disableAction = this.#logicService.setDisableSubRefundFT(haftTime.settlementStatusId, fulltime.settlementStatusId);
    }

    return (matchDetail.isSettleDetermined && disableAction === RefundType.sdt) || (!matchDetail.isSettleDetermined && disableAction === RefundType.normal);
  }


  private scoreChanged(storage: RefundBaseStorage) {
    const haftTime = storage.getHalfTimeResult();
    const fulltime = storage.getFullTimeResult();
    const refundStatus = [SettlementStatusId.Abandoned1H, SettlementStatusId.Abandoned2H];

    if (refundStatus.indexOf(haftTime.settlementStatusId) > -1) {
      return Number(haftTime.homeValue) !== Number(haftTime.originalHomeValue) || Number(haftTime.awayValue) !== Number(haftTime.originalAwayValue);
    }

    if (refundStatus.indexOf(fulltime.settlementStatusId) > -1) {
      return Number(fulltime.homeValue) !== Number(fulltime.originalHomeValue) || Number(fulltime.awayValue) !== Number(fulltime.originalAwayValue);
    }

    return false;
  }
} 