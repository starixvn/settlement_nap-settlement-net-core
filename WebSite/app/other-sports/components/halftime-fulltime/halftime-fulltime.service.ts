import { Injectable } from '@angular/core';
import { Match, MatchDetail } from '../../models';
import * as _ from 'lodash';
import { Language } from '../../../shared/language';
import { MessageBoxService } from '../../../shared/services';
import { ModalDialogMessage } from '../../../shared/models';
import { KickOffTime, ResourcesIds } from '../../constants';
import { SportType, MatchStatus, TicketStatusText, CalculateAction, EventStatus } from '../../../shared/constants';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
@Injectable()
export class HalfTimeFullTimeService {
    public confirmDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    constructor(private readonly messageBoxService: MessageBoxService) {
        this.confirmDialogMessage.title = Language.confirmationBox;
    }

    public numberSetOnHalfTime(sportType: number) {
        const baseballHalfTimeNode = 5;
        const footballHalfTimeNode = 2;
        if (_.isEqual(sportType, SportType.baseBall)) {
            return baseballHalfTimeNode;
        } else if (_.includes([SportType.football, SportType.rugby, SportType.netBall], sportType)) {
            return footballHalfTimeNode;
        } else {
            return 0;
        }
    }

    public isReadyMatch(matchDetail: MatchDetail) {
        return this.isCompletedOrConfirmScore(matchDetail) || this.isReadyMatchBySportType(matchDetail.sportType, matchDetail.playTime);
    }

    private isCompletedOrConfirmScore(matchDetail: MatchDetail) {
        return matchDetail.confirmHT > 0 || matchDetail.confirmFT > 0
            || _.isEqual(matchDetail.eventStatus, MatchStatus.Completed);
    }

    private isReadyMatchBySportType(sportType: number, playTime: number) {
        if (_.includes([SportType.baseBall, SportType.iceHockey], sportType)) {
            return playTime >= KickOffTime.baseball;
        } else {
            return playTime >= KickOffTime.playTime;
        }
    }

    public processScore(matchDetail: MatchDetail, halfTime: ResultDetail, fullTime: ResultDetail,
        resultDetails: ResultDetail[], halfTimeNode: number, isLeader: boolean, isCalcPage = true) {
        const hideFtScore = !(isLeader || matchDetail.isCalculated || matchDetail.isCalRefund);
        const hideHtScore = !(isLeader || matchDetail.isHalfTimeCal || matchDetail.isCalRefund);
        this.processFullTimeScore(fullTime, hideFtScore, isCalcPage, matchDetail);
        this.processHalfTimeScore(halfTime, hideHtScore, isCalcPage, matchDetail);
        matchDetail.betStatus = matchDetail.betStatus ?? "";
        resultDetails.forEach((item, index) => {
            if (index < halfTimeNode) {
                if (!hideHtScore || !hideFtScore) {
                    return;
                }
                this.resetScore(item);
            } else if(hideFtScore){
                     this.resetScore(item);
            }
        });
    }

    private processFullTimeScore(fullTime: ResultDetail, hideFtScore: boolean, isCalcPage: boolean, matchDetail: MatchDetail) {
        if (this.resultIsEmpty(fullTime) || hideFtScore || (isCalcPage && matchDetail.betStatus?.includes('Refund'))) {
            this.resetScore(fullTime);
        }
    }

    private processHalfTimeScore(halfTime: ResultDetail, hideHtScore: boolean, isCalcPage: boolean, matchDetail: MatchDetail) {
        if (!_.isNil(halfTime) &&
            (this.resultIsEmpty(halfTime) || hideHtScore || (isCalcPage && matchDetail.betStatus?.includes('Refund;')))) {
            this.resetScore(halfTime);
        }
    }

    private resetScore(resultDetail: ResultDetail) {
        resultDetail.homeValue = null;
        resultDetail.awayValue = null;
    }

    public copyScore(result: ResultDetail, matchDetail: MatchDetail, message: string, externalSourceName: string) {
        this.confirmDialogMessage.message = message.replace("'provider_name'", externalSourceName);
        this.messageBoxService.confirm(this.confirmDialogMessage, () => {
            if (_.isEqual(result.resourceId, ResourcesIds.fullTime)) {
                result.homeValue = matchDetail.exFTHomeScore.toString();
                result.awayValue = matchDetail.exFTAwayScore.toString();
            } else {
                result.homeValue = matchDetail.exHTHomeScore.toString();
                result.awayValue = matchDetail.exHTAwayScore.toString();
            }
        });
    }

    public copyAllScore(halfTime: ResultDetail, fullTime: ResultDetail, matchDetail: MatchDetail, externalSourceName: string) {
        const message = Language.confirmCopyScore.replace("'provider_name'", externalSourceName);
        this.confirmDialogMessage.message = message;
        this.messageBoxService.confirm(this.confirmDialogMessage, () => {
            halfTime.homeValue = matchDetail.exHTHomeScore.toString();
            halfTime.awayValue = matchDetail.exHTAwayScore.toString();
            fullTime.homeValue = matchDetail.exFTHomeScore.toString();
            fullTime.awayValue = matchDetail.exFTAwayScore.toString();
        });
    }

    public sumScore(resultDetails: ResultDetail[], stopNode: number) {
        const result = new ResultDetail();
        let home = 0;
        let away = 0;
        for (let i = 0; i < stopNode; i++) {
            home += Number(resultDetails[i].homeValue);
            away += Number(resultDetails[i].awayValue);
        }
        result.homeValue = home.toString();
        result.awayValue = away.toString();

        return result;
    }

    public compareHalfTimeScore(resultDetails: ResultDetail[],
        lastestMatch: Match, isScoreDirect: boolean, halfTimeNode: number) {
        const matchDetail = lastestMatch.matchDetail;
        return _.isEqual(matchDetail.htStatus, TicketStatusText.calculated)
            && (this.isScoreHTChanged(resultDetails, lastestMatch)
                || this.compareScoreSets(resultDetails.slice(0, halfTimeNode), lastestMatch.resultDetails, isScoreDirect));
    }

    public compareFullTimeScore(resultDetails: ResultDetail[], lastestMatch: Match, isScoreDirect: boolean) {
        const matchDetail = lastestMatch.matchDetail;
        return _.isEqual(matchDetail.ftStatus, TicketStatusText.calculated) &&
            (this.isScoreFTChanged(resultDetails, lastestMatch)
                || this.compareScoreSets(resultDetails, lastestMatch.resultDetails, isScoreDirect));
    }

    public compareAllScore(resultDetails: ResultDetail[], lastestMatch: Match, isScoreDirect: boolean) {
        const matchDetail = lastestMatch.matchDetail;
        const statusCalculated = _.isEqual(matchDetail.htStatus, TicketStatusText.calculated) ||
            _.isEqual(matchDetail.ftStatus, TicketStatusText.calculated);
        return statusCalculated && (this.isScoreFTChanged(resultDetails, lastestMatch)
            || this.isScoreHTChanged(resultDetails, lastestMatch)
            || this.compareScoreSets(resultDetails, lastestMatch.resultDetails, isScoreDirect));
    }

    private compareScoreSets(resultDetails: ResultDetail[], lastestResults: ResultDetail[], isScoreDirect: boolean) {
        if (isScoreDirect) {
            return false;
        } else {
            return this.compareScore(resultDetails, lastestResults);
        }
    }

    private compareScore(resultDetails: ResultDetail[], lastestResults: ResultDetail[]) {
        let needConfirm = false;
        resultDetails = _.filter(resultDetails, item => !_.isEqual(item.resourceId, ResourcesIds.fullTime)
            && !_.isEqual(item.resourceId, ResourcesIds.halfTime));
        _.forEach(resultDetails, (result) => {
            const correspondingResult = _.find(lastestResults, (item) => _.isEqual(item.resourceId, result.resourceId));
            if (correspondingResult && !_.isEqual(result.homeValue, correspondingResult.homeValue)
                || !_.isEqual(result.awayValue, correspondingResult.awayValue)) {
                needConfirm = true;
            }
        });
        return needConfirm;
    }

    private isScoreFTChanged(resultDetails: ResultDetail[], lastestMatch: Match) {
        const fulltimeResult = _.find(resultDetails, item => _.isEqual(item.resourceId, ResourcesIds.fullTime));
        const lastestFullTime = _.find(lastestMatch.resultDetails, item => _.isEqual(item.resourceId, ResourcesIds.fullTime));
        return !_.isEqual(fulltimeResult.homeValue, lastestFullTime.homeValue)
            || !_.isEqual(fulltimeResult.awayValue, lastestFullTime.awayValue)
            || lastestMatch.matchDetail.betStatus.includes('Refund');
    }

    private isScoreHTChanged(resultDetails: ResultDetail[], lastestMatch: Match) {
        const halfTimeResult = _.find(resultDetails, item => _.isEqual(item.resourceId, ResourcesIds.halfTime));
        const lastestHalfTime = _.find(lastestMatch.resultDetails, item => _.isEqual(item.resourceId, ResourcesIds.halfTime));
        return !_.isNil(halfTimeResult) && (!_.isEqual(halfTimeResult.homeValue, lastestHalfTime.homeValue)
            || !_.isEqual(halfTimeResult.awayValue, lastestHalfTime.awayValue)
            || lastestMatch.matchDetail.betStatus.includes('Refund;'));
    }

    public halfTimeConfirmed(matchDetail: MatchDetail, halfTimeOriginal: ResultDetail) {
        return this.isScoreConfirmed(matchDetail, halfTimeOriginal) && !matchDetail.isHalfTimeCal && !matchDetail.isCalRefund;
    }

    public fullTimeConfirmed(matchDetail: MatchDetail, fullTimeOriginal: ResultDetail) {
        return this.isScoreConfirmed(matchDetail, fullTimeOriginal) && !matchDetail.isCalculated && !matchDetail.isCalRefund;
    }

    public isScoreConfirmed(matchDetail: MatchDetail, resultDetail: ResultDetail) {
        const hasConfirm = _.isEqual(resultDetail.resourceId, ResourcesIds.fullTime)
            ? matchDetail.confirmFT > 0 : matchDetail.confirmHT > 0;
        return hasConfirm && !this.resultIsEmpty(resultDetail);
    }

    public isExistProviderScore(matchDetail: MatchDetail, isHalfTime = true) {
        return isHalfTime ? !_.isNull(matchDetail.exHTHomeScore) && !_.isNull(matchDetail.exHTAwayScore) :
            !_.isNull(matchDetail.exFTHomeScore) && !_.isNull(matchDetail.exFTAwayScore);
    }

    public isScoreMismatchHalfTime(halfTime: ResultDetail, matchDetail: MatchDetail, traderHalfTime: ResultDetail) {
        const isExistTraderScore = this.isScoreConfirmed(matchDetail, traderHalfTime);
        const isExistProviderScore = this.isExistProviderScore(matchDetail);
        let isInconsistent = false;
        if (!this.resultIsEmpty(halfTime)) {
            isInconsistent = this.compareResultWithConfirmCore(isExistTraderScore, isExistProviderScore, matchDetail,
                traderHalfTime, halfTime);
        } else if (isExistTraderScore && isExistProviderScore) {
            isInconsistent = !_.isEqual(traderHalfTime.homeValue, matchDetail.exHTHomeScore.toString())
                || !_.isEqual(traderHalfTime.awayValue, matchDetail.exHTAwayScore.toString());
        }

        halfTime.isScoreMismatched = isInconsistent;
    }

    private compareResultWithConfirmCore(isExistTraderScore: boolean, isExistProviderScore: boolean, matchDetail: MatchDetail,
        resultOriginal: ResultDetail, resultDetail: ResultDetail, isHalfTime = true) {
        let isInconsistent = false;
        if (isExistTraderScore) {
            isInconsistent = resultDetail.homeValue !== resultOriginal.homeValue
                || resultDetail.awayValue !== resultOriginal.awayValue;
        }

        if (!isInconsistent && isExistProviderScore) {
            isInconsistent = resultDetail.homeValue !== (isHalfTime ? matchDetail.exHTHomeScore : matchDetail.exFTHomeScore).toString()
                || resultDetail.awayValue !== (isHalfTime ? matchDetail.exHTAwayScore : matchDetail.exFTAwayScore).toString();
        }

        return isInconsistent;
    }

    public resultIsEmpty(item: ResultDetail) {
        return item.homeValue === null || _.isEmpty(item.homeValue)
            || item.awayValue === null || _.isEmpty(item.awayValue);
    }

    public isScoreMismatchFullTime(fullTime: ResultDetail, matchDetail: MatchDetail, traderFullTime: ResultDetail) {
        const isExistTraderScore = this.isScoreConfirmed(matchDetail, traderFullTime);
        const isExistProviderScore = this.isExistProviderScore(matchDetail, false);
        let isInconsistent = false;
        if (!this.resultIsEmpty(fullTime)) {
            isInconsistent = this.compareResultWithConfirmCore(isExistTraderScore, isExistProviderScore, matchDetail,
                traderFullTime, fullTime, false);
        } else if (isExistTraderScore && isExistProviderScore) {
            isInconsistent = !_.isEqual(traderFullTime.homeValue, matchDetail.exFTHomeScore.toString())
                || !_.isEqual(traderFullTime.awayValue, matchDetail.exFTAwayScore.toString());
        }
        fullTime.isScoreMismatched = isInconsistent;
    }

    public getMessageConfirmRefund(isParlay: boolean, action: string) {
        if (isParlay) {
            return _.isEqual(action, CalculateAction.refund) ?
                Language.RefundParlayConfirmMessage : Language.RefundParlayFullTime;
        } else {
            return _.isEqual(action, CalculateAction.refund) ?
                Language.RefundConfirmMessage : Language.RefundFullMessage;
        }
    }

    public getFirstConfirmMessage(actionType: string) {
        return _.isEqual(actionType, CalculateAction.calculateHalfTime) ? Language.doubleCheckCalculateHalfTime :
            _.isEqual(actionType, CalculateAction.calculateFullTime) ? Language.doubleCheckCalculateFullTime
                : Language.doubleCheckCalculateAll;
    }

    public getSecondConfirmMessage(actionType: string) {
        return _.isEqual(actionType, CalculateAction.calculateHalfTime) ? Language.checkAgainCalculateHalfTime :
            _.isEqual(actionType, CalculateAction.calculateFullTime) ? Language.checkAgainCalculateFullTime
                : Language.checkAgainCalculateAll;
    }

    public autoFillOnload(resultDetails: ResultDetail[], matchDetail: MatchDetail,
        halfTime: ResultDetail, fullTime: ResultDetail, halfTimeNode: number) {
        const halfTimeScoreAutoSum = this.sumScore(resultDetails, halfTimeNode);
        const finalScoreAutoSum = this.sumScore(resultDetails, resultDetails.length);
        if (halfTimeNode > 0 && this.resultIsEmpty(halfTime) &&
            (Number(halfTimeScoreAutoSum.awayValue) > 0 || Number(halfTimeScoreAutoSum.homeValue) > 0)
            && !matchDetail.betStatus.includes('Refund;')) {
            halfTime.homeValue = halfTimeScoreAutoSum.homeValue;
            halfTime.awayValue = halfTimeScoreAutoSum.awayValue;
        }
        if (this.resultIsEmpty(fullTime) &&
            (Number(finalScoreAutoSum.awayValue) > 0 || Number(finalScoreAutoSum.homeValue) > 0)
            && !matchDetail.betStatus.includes(EventStatus.refund)) {
            fullTime.homeValue = finalScoreAutoSum.homeValue;
            fullTime.awayValue = finalScoreAutoSum.awayValue;
        }
    }
}