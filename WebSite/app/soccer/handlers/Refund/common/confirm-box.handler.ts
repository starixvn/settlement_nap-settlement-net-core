import { Storage } from './../../../../baseball/services/storage.service';
import { CalculateAction } from "../../../../shared/constants";
import { Language } from "../../../../shared/language.native";
import { Match } from "../../../components/refund/model/match.model";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { inject } from '@angular/core';
import { LogicService } from '../../../components/sop-refund/services/logic.service';
import { isEqual } from "lodash";

export class ConfirmBoxHandler extends AbstractHandler {
    #logicService = inject(LogicService)
    public handle(storage: RefundBaseStorage): void {
        const match = storage.getMatch();
        const actionName = this.#logicService.getActionName();
        storage.setConfirmMessage(this.getMessageConfirm(actionName, match));
        this.#logicService.showConfirmMessage(() => {
            this.mapResults(storage);
            super.handle(storage);
        });
    }

    private mapResults(storage: RefundBaseStorage) {
     const htResult = storage.getHalfTimeResult();
     const ftResult = storage.getFullTimeResult();
     const { matchDetail } = storage.getMatch();
     if(matchDetail.isSettleAbandonedMatchIBC){
        matchDetail.halfTimeAwayScore = htResult.awayValue;
        matchDetail.halfTimeHomeScore = htResult.homeValue;
        matchDetail.finalAwayScore = ftResult.awayValue;
        matchDetail.finalHomeScore = ftResult.homeValue;
     }
     else{
        matchDetail.halfTimeAwayScore = null;
        matchDetail.halfTimeHomeScore = null;
        matchDetail.finalAwayScore = null;
        matchDetail.finalHomeScore = null;
     }
    }
    private getMessageConfirm(actionName: string, match: Match) {
        const isAbandonedMatch = match.matchDetail.isSettleAbandonedMatchIBC || match.betDaq.settleDeterminedBetDaq ||
            match.betFair.settleDeterminedBetFair;
        if (isEqual(actionName, CalculateAction.refund)) {
            return isAbandonedMatch ? Language.soccer.refundAllAbandoned : Language.soccer.refundAllNormal;
        } else if (isEqual(actionName, CalculateAction.refundFullTime)) {
            return isAbandonedMatch ? Language.soccer.refundFullTimeAbandoned : Language.soccer.refundFullTimeNormalNotSdt;
        } else {
            match.matchDetail.isSettleAbandonedMatchIBC = false;
            return Language.soccer.refundHalfTime;
        }
    }
}