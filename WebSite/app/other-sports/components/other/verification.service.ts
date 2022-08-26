import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { Match, MatchDetail } from "../../models";
import { RequestService } from "../../services/request.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CalculateAction, TicketStatusText } from "../../../shared/constants";

@Injectable()
export class VerificationService {
    constructor(private readonly requestService: RequestService) {}

    public isScoreInconsistent(matchDetail: MatchDetail) {
        return !this.isScoreEmpty(matchDetail.halfTimeHomeScore, matchDetail.halfTimeAwayScore)
            && !this.isScoreEmpty(matchDetail.finalHomeScore, matchDetail.finalAwayScore)
            && (matchDetail.halfTimeHomeScore > matchDetail.finalHomeScore || matchDetail.halfTimeAwayScore > matchDetail.finalAwayScore);
    }

    public isHaltTimeScoreMismatched(matchDetail: MatchDetail) {
        const isExistTraderScore = this.isHtScoreConfirmed(matchDetail);
        const isExistInputScore = !this.isHalfTimeScoreInvalid(matchDetail);
        const isExistProviderScore = this.isExistHalfTimeProviderScore(matchDetail);
        return this.isScoreMismatched(matchDetail, isExistTraderScore, isExistInputScore, isExistProviderScore, true);
    }

    private isScoreMismatched(matchDetail: MatchDetail, isExistTraderScore: boolean, isExistInputScore: boolean,
        isExistProviderScore: boolean, checkingHalfTime = false) {
        let isMismatched = false;
        if (isExistInputScore) {
            isMismatched = this.isInputScoreMismatchedWithExternalScores(isExistTraderScore, isExistProviderScore,
                matchDetail, checkingHalfTime);
        } else if (isExistTraderScore && isExistProviderScore) {
            isMismatched = this.isTraderScoreMismatchedWithProviderScore(matchDetail, checkingHalfTime);
        }

        return isMismatched;
    }

    private isInputScoreMismatchedWithExternalScores(isExistTraderScore: boolean, isExistProviderScore: boolean,
        matchDetail: MatchDetail, checkingHalfTime: boolean) {
        let isMismatched = false;
        if (isExistTraderScore) {
            isMismatched = checkingHalfTime
                ? this.isScoreDifferent(matchDetail.halfTimeHomeScore, matchDetail.halfTimeAwayScore,
                    matchDetail.originalHalfTimeHomeScore, matchDetail.originalHalfTimeAwayScore)
                : this.isScoreDifferent(matchDetail.finalHomeScore, matchDetail.finalAwayScore,
                    matchDetail.originalFinalHomeScore, matchDetail.originalFinalAwayScore);
        }

        if (!isMismatched && isExistProviderScore) {
            isMismatched = checkingHalfTime
                ? this.isScoreDifferent(matchDetail.halfTimeHomeScore, matchDetail.halfTimeAwayScore,
                    matchDetail.exHTHomeScore, matchDetail.exHTAwayScore)
                : this.isScoreDifferent(matchDetail.finalHomeScore, matchDetail.finalAwayScore,
                    matchDetail.exFTHomeScore, matchDetail.exFTAwayScore);
        }

        return isMismatched;
    }

    private isTraderScoreMismatchedWithProviderScore(matchDetail: MatchDetail, checkingHalfTime: boolean) {
        return checkingHalfTime
            ? this.isScoreDifferent(matchDetail.originalHalfTimeHomeScore, matchDetail.originalHalfTimeAwayScore,
                matchDetail.exHTHomeScore, matchDetail.exHTAwayScore)
            : this.isScoreDifferent(matchDetail.originalFinalHomeScore, matchDetail.originalFinalAwayScore,
                matchDetail.exFTHomeScore, matchDetail.exFTAwayScore);
    }

    private isScoreDifferent(inputHome: number, inputAway: number, traderHome: number, traderAway: number) {
        return Number(inputHome) !== traderHome || Number(inputAway) !== traderAway;
    }

    public isFinalScoreMismatched(matchDetail: MatchDetail) {
        const isExistTraderScore = this.isFinalScoreConfirmed(matchDetail);
        const isExistInputScore = !this.isFinalScoreInvalid(matchDetail);
        const isExistProviderScore = this.isExistFinalProviderScore(matchDetail);
        return this.isScoreMismatched(matchDetail, isExistTraderScore, isExistInputScore, isExistProviderScore);
    }

    public isHtScoreConfirmed(matchDetail: MatchDetail) {
        return matchDetail.confirmHT > 0 && !_.isNil(matchDetail.originalHalfTimeHomeScore)
        && !_.isNil(matchDetail.originalHalfTimeAwayScore);
    }

    public isFinalScoreConfirmed(matchDetail: MatchDetail) {
        return matchDetail.confirmFT > 0 && !_.isNil(matchDetail.originalFinalHomeScore)
        && !_.isNil(matchDetail.originalFinalAwayScore);
    }

    public isScoreEmpty(homeValue: number, awayValue: number) {
        return _.isEmpty(homeValue?.toString()) || _.isEmpty(awayValue?.toString());
    }

    public isHalfTimeScoreInvalid(matchDetail: MatchDetail) {
        return this.isScoreEmpty(matchDetail.halfTimeHomeScore, matchDetail.halfTimeAwayScore);
    }

    public isFinalScoreInvalid(matchDetail: MatchDetail) {
        return this.isScoreEmpty(matchDetail.finalHomeScore, matchDetail.finalAwayScore);
    }

    public isScoreInvalid(matchDetail: MatchDetail) {
        return this.isHalfTimeScoreInvalid(matchDetail) || this.isFinalScoreInvalid(matchDetail);
    }

    public isScoreSourceInsufficient(actionType: string, matchDetail: MatchDetail) {
        if (_.isEqual(actionType, CalculateAction.calculateHalfTime)) {
            return !this.existHalfTimeExternalScore(matchDetail);
        } else if (_.isEqual(actionType, CalculateAction.calculateFullTime)) {
            return !this.existFinalExternalScore(matchDetail);
        } else {
            return !this.existHalfTimeExternalScore(matchDetail)
                && !this.existFinalExternalScore(matchDetail);
        }
    }

    private existHalfTimeExternalScore(matchDetail: MatchDetail) {
        return this.isExistHalfTimeProviderScore(matchDetail)
            || this.isHtScoreConfirmed(matchDetail);
    }

    private existFinalExternalScore(matchDetail: MatchDetail) {
        return this.isExistFinalProviderScore(matchDetail)
            || this.isFinalScoreConfirmed(matchDetail);
    }

    private isExistFinalProviderScore(matchDetail: MatchDetail) {
        return !_.isNil(matchDetail.exFTHomeScore) && !_.isNil(matchDetail.exFTAwayScore);
    }

    private isExistHalfTimeProviderScore(matchDetail: MatchDetail) {
        return !_.isNil(matchDetail.exHTHomeScore) && !_.isNil(matchDetail.exHTAwayScore);
    }

    public verifyChangedSettledTickets(matchDetail: MatchDetail, action: string) : Observable<boolean> {
        const query = {
            matchId: matchDetail.matchId
        };

        return this.requestService.getLastestResult(query).pipe(map((lastestMatch: Match) => {
            if (_.isEqual(action, CalculateAction.calculateHalfTime)) {
                return this.isHalfTimeChanged(matchDetail, lastestMatch.matchDetail);
            } else if (_.isEqual(action, CalculateAction.calculateFullTime)) {
                return this.isFinalChanged(matchDetail, lastestMatch.matchDetail);
            } else {
                return this.isHalfTimeChanged(matchDetail, lastestMatch.matchDetail)
                    || this.isFinalChanged(matchDetail, lastestMatch.matchDetail);
            }
        }));
    }

    private isHalfTimeChanged(matchDetail: MatchDetail, lastestMatchDetail: MatchDetail) {
        return _.isEqual(lastestMatchDetail.htStatus, TicketStatusText.calculated)
            && (!_.isEqual(matchDetail.halfTimeHomeScore.toString(), lastestMatchDetail.halfTimeHomeScore?.toString())
            || !_.isEqual(matchDetail.halfTimeAwayScore.toString(), lastestMatchDetail.halfTimeAwayScore?.toString())
            ||  lastestMatchDetail.betStatus.includes('Refund;'));
    }

    private isFinalChanged(matchDetail: MatchDetail, lastestMatchDetail: MatchDetail) {
        return _.isEqual(lastestMatchDetail.ftStatus, TicketStatusText.calculated)
            && (!_.isEqual(matchDetail.finalHomeScore.toString(), lastestMatchDetail.finalHomeScore?.toString())
            || !_.isEqual(matchDetail.finalAwayScore.toString(), lastestMatchDetail.finalAwayScore?.toString())
            ||  lastestMatchDetail.betStatus.includes('Refund'));
    }
}