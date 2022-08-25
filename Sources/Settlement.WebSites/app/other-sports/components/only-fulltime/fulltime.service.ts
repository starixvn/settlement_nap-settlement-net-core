import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { MessageBoxService } from '../../../shared/services';
import { MatchDetail, Permission, RequestSettle } from '../../models';
import { CalculateAction, SportType } from '../../../shared/constants';
import { Result } from '../../../shared/models';
import { RequestService } from '../..//services/request.service';
@Injectable()
export class FullTimeService {
    constructor(private readonly requestService: RequestService,
        private readonly messageBoxService: MessageBoxService) { }

    public async settle(type: string, isReSettledTickets: boolean, matchDetail: MatchDetail, refResultStatus: number = null) {
        if (matchDetail.sportType !== SportType.muayThai) {
            matchDetail.betStatus = '';
        }
        const query = new RequestSettle(matchDetail.matchId,
        type, isReSettledTickets, matchDetail.betStatus,
        matchDetail.finalHomeScore, matchDetail.finalAwayScore, refResultStatus);

        const result = await this.requestService.calculate(query).toPromise() as Result;
        return this.getMessage(matchDetail.matchId, result);
    }

    public async refund(matchDetail: MatchDetail) {
        const query = new RequestSettle(matchDetail.matchId,
        CalculateAction.refund, false, "",
        matchDetail.finalHomeScore, matchDetail.finalAwayScore);
        const result = await this.requestService.refund(query).toPromise() as Result;
        return this.getMessage(matchDetail.matchId, result);
    }

    public async refundParlay(matchId: number) {
        const paramsRefundParlay = {
            matchId,
            action: CalculateAction.refund,
            settleAbandonedMatchIbcParlay: 0,
        };
        const result = await this.requestService.refundParlay(paramsRefundParlay) .toPromise() as Result;
        return this.getMessage(matchId, result);
    }

    private getMessage(matchId: number, result: Result){
        if (result.isSuccessful) {
            this.messageBoxService.closePopup();
            return "";
        } else {
            return result.errMsg;
        }
    }

    public initScoreByPermission(matchDetail: MatchDetail, permission: Permission) {
        matchDetail.originalFinalHomeScore = matchDetail.finalHomeScore;
        matchDetail.originalFinalAwayScore = matchDetail.finalAwayScore;
        matchDetail.finalHomeScore = permission.isLeader || matchDetail.isCalculated || matchDetail.isCalRefund
            ? matchDetail.finalHomeScore : null;
        matchDetail.finalAwayScore = permission.isLeader || matchDetail.isCalculated || matchDetail.isCalRefund
            ? matchDetail.finalAwayScore : null;
    }
}