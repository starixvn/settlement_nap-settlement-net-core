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
        const query = new RequestSettle(matchDetail,
        type, isReSettledTickets, matchDetail.betStatus,
        matchDetail.finalHomeScore, matchDetail.finalAwayScore, refResultStatus);

        const result = await this.requestService.sendRequest(query);
        return this.getMessage(result);
    }

    public async refund(matchDetail: MatchDetail) {
        const query = new RequestSettle(matchDetail,
        CalculateAction.refund, false, "",
        matchDetail.finalHomeScore, matchDetail.finalAwayScore);
        const result = await this.requestService.sendRequest(query);
        return this.getMessage(result);
    }

    private getMessage(result: Result){
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