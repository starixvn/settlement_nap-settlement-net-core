import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { RequestService } from './request.service';
import { MatchDetail, MatchWaitingRequest, SportLeagues } from '../models';
import { QueueStatus, EventStatus } from '../constants';
@Injectable()
export class RefreshMatchService {
    constructor(private readonly requestService: RequestService) {
    }

    public refreshMatches(currentSportMatches: SportLeagues[], request: MatchWaitingRequest) {
        this.requestService.refreshMatches(request).subscribe((matchesWaiting: MatchDetail[]) => {
            this.changeInfoAfterRefreshMatches(currentSportMatches, matchesWaiting);
        });
    }

    private changeInfoAfterRefreshMatches(currentSportMatches: SportLeagues[], matchWaitingDetail: MatchDetail[]) {
        currentSportMatches.forEach((sport) => {
            sport.leagues.forEach((league) => {
                league.matches.forEach((match) => {
                    const newMatch = _.find(matchWaitingDetail, (mw: MatchDetail) =>
                        mw.matchId === match.matchId && (mw.eventStatus !== match.eventStatus
                            || mw.moreScores !== match.moreScores
                            || mw.parlayStatus !== match.parlayStatus
                            || mw.autoCalcSetting.isAutoSettingForMatch !== match.autoCalcSetting.isAutoSettingForMatch
                            || mw.queueStatus !== match.queueStatus));
                    if (!_.isNil(newMatch)) {
                        match.eventStatus = newMatch.eventStatus;
                        match.moreScores = newMatch.moreScores;
                        match.parlayStatus = this.getParlayStatus(newMatch.parlayStatus, newMatch.queueStatus);
                        match.autoCalcSetting.isAutoSettingForMatch = newMatch.autoCalcSetting.isAutoSettingForMatch;
                        match.isShowLink = true;
                    }
                });
            });
        });
    }

    private getParlayStatus(currentParlayStatus: string, queueStatus: number) {
        if (queueStatus === QueueStatus.waiting) {
            return EventStatus.waiting;
        } else if (queueStatus === QueueStatus.calculating) {
            return EventStatus.calculating;
        } else {
            return currentParlayStatus;
        }
    }
}