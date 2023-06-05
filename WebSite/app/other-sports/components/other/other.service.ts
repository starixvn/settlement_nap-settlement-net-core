import { Injectable } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { CalculateAction, MatchStatus, SportType } from "../../../shared/constants";
import * as _ from 'lodash';
import { Result } from "../../../shared/models";
import { RequestService } from "../../services/request.service";
import { HedgeMatchDetail, } from "../../../shared/models/sportsbook-sop";
import { MatchDetail, Permission, RequestSettle } from "../../models";
import { KickOffTime } from "../../constants";

@Injectable()
export class OtherService {

    constructor(private readonly requestService: RequestService) { }

    public getMessageConfirmRefund(action: string) {
        return _.isEqual(action, CalculateAction.refund) ?
            Language.RefundConfirmMessage : Language.RefundFullMessage;

    }

    public async sendRequest(matchDetail: MatchDetail, hedgeMatchDetail: HedgeMatchDetail,
        action: string) {
        const param = {
            matchId: matchDetail.matchId,
            action,
            hedgeMatchId: _.isNull(hedgeMatchDetail) ? 0 : hedgeMatchDetail.matchId,
            betStatus: matchDetail.betStatus,
            sportType: matchDetail.sportType
        };

        return await this.requestService.sendRequest(param);
    }

    public isReadyMatch(matchDetail: MatchDetail) {
        return this.isCompletedOrConfirmScore(matchDetail) || this.isMatchReadyBySportType(matchDetail);
    }

    private isCompletedOrConfirmScore(matchDetail: MatchDetail) {
        return matchDetail.confirmHT > 0 || matchDetail.confirmFT > 0
            || _.isEqual(matchDetail.eventStatus, MatchStatus.Completed);
    }

    private isMatchReadyBySportType(matchDetail: MatchDetail) {
        const isKabbadiTemplate = _.includes([SportType.kabaddi, SportType.futsal], matchDetail.sportType);
        const isReadyForKabbadi = matchDetail.playTime >= KickOffTime.kabaddi;
        const isReadyForOtherSports = matchDetail.playTime >= KickOffTime.playTime;
        return isKabbadiTemplate ? isReadyForKabbadi : isReadyForOtherSports;
    }

    public initScoreByPermission(matchDetail: MatchDetail, permission: Permission) {
        matchDetail.originalFinalHomeScore = matchDetail.finalHomeScore;
        matchDetail.originalFinalAwayScore = matchDetail.finalAwayScore;
        matchDetail.originalHalfTimeHomeScore = matchDetail.halfTimeHomeScore;
        matchDetail.originalHalfTimeAwayScore = matchDetail.halfTimeAwayScore;
        const showHalfTimetScore = (permission.isLeader || matchDetail.isHalfTimeCal) && !matchDetail.betStatus?.includes("Refund;");
        const showFinalScore = (permission.isLeader || matchDetail.isCalculated) && !matchDetail.isCalRefund;
        matchDetail.finalHomeScore = showFinalScore ? matchDetail.finalHomeScore : null;
        matchDetail.finalAwayScore = showFinalScore ? matchDetail.finalAwayScore : null;
        matchDetail.halfTimeHomeScore = showHalfTimetScore ? matchDetail.halfTimeHomeScore : null;
        matchDetail.halfTimeAwayScore = showHalfTimetScore ? matchDetail.halfTimeAwayScore : null;
    }

    public showButtonBySportType(sportType: number) {
        return _.includes([SportType.kabaddi, SportType.futsal, SportType.lotto], sportType);
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

    public async settle(type: string, isReSettledTickets: boolean, matchDetail: MatchDetail, refResultStatus: number = null,
        hedgeMatchId = 0) {
        const betStatus = this.getBetStatus(matchDetail, type);
        const query = new RequestSettle(matchDetail,
            type, isReSettledTickets, betStatus,
            matchDetail.finalHomeScore, matchDetail.finalAwayScore, refResultStatus);
        query.halfTimeHomeScore = matchDetail.halfTimeHomeScore;
        query.halfTimeAwayScore = matchDetail.halfTimeAwayScore;
        query.hedgeMatchId = hedgeMatchId;
        query.isApplyHedging = hedgeMatchId > 0;

        return await this.requestService.sendRequest(query);
    }

    public copyHalfTimeScore(matchDetail: MatchDetail) {
        matchDetail.halfTimeHomeScore = matchDetail.exHTHomeScore;
        matchDetail.halfTimeAwayScore = matchDetail.exHTAwayScore;
    }

    public copyFinalScore(matchDetail: MatchDetail) {
        matchDetail.finalHomeScore = matchDetail.exFTHomeScore;
        matchDetail.finalAwayScore = matchDetail.exFTAwayScore;
    }

    public copyScores(matchDetail: MatchDetail) {
        this.copyHalfTimeScore(matchDetail);
        this.copyFinalScore(matchDetail);
    }

    private getBetStatus(matchDetail: MatchDetail, actionType: string) {
        const refundFT = "Refund FT";
        const isKabbadiTemplate = _.includes([SportType.kabaddi, SportType.futsal], matchDetail.sportType);
        const betStatusContainRefundFT = !(_.isEmpty(matchDetail.betStatus) || matchDetail.betStatus === null)
            && _.includes(matchDetail.betStatus, refundFT);
        if (isKabbadiTemplate && _.isEqual(actionType, CalculateAction.calculateHalfTime) && betStatusContainRefundFT) {
            return matchDetail.betStatus;
        }

        return "";
    }
}