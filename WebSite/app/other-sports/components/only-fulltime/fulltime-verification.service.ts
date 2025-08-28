import { inject, Injectable } from '@angular/core';
import { Match, MatchDetail, MappedScore } from '../../models';
import * as _ from 'lodash';
import { SportType, TicketStatusText } from '../../../shared/constants';
import { Language } from '../../../shared/language.native';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { RequestService } from '../..//services/request.service';
import { MappedScoreService } from './mapped-score.service';
@Injectable()
export class FullTimeVerificationService {
    private readonly requestService = inject(RequestService);
     private readonly mappedScoreService = inject(MappedScoreService);

    public checkScoreMuayThai(matchDetail: MatchDetail) {
        if (matchDetail.sportType !== SportType.muayThai) {
            return '';
        }

        const finalScore = `${matchDetail.finalHomeScore}-${matchDetail.finalAwayScore}`;
        if (this.checkFinalScore(finalScore)) {
            return "Please input the correct Final Score.";
        }

        const sum = Number(matchDetail.finalHomeScore) + Number(matchDetail.finalAwayScore);
        if (_.isEmpty(matchDetail.betStatus) && sum === 1) {
            return "Please input the correct 'KO at Round'";
        }

        return '';
    }

    private checkFinalScore(finalScore) {
        return finalScore.length > 3 || (finalScore.indexOf("1-0") === -1 && finalScore.indexOf("0-1") === -1 &&
            finalScore.indexOf("3-0") === -1 && finalScore.indexOf("0-3") === -1 && finalScore.indexOf("3-3") === -1 &&
            finalScore.indexOf("5-0") === -1 && finalScore.indexOf("0-5") === -1 && finalScore.indexOf("5-5") === -1)
    }

    public verifyCopyScore(matchDetail: MatchDetail) {
        if (matchDetail.isFullTimeSettled) {
            return Language.scoreSettledWarning;
        }

        if (_.isEmpty(matchDetail.exFTHomeScore?.toString()) || _.isEmpty(matchDetail.exFTAwayScore?.toString())) {
            return Language.missingScoreWarning;
        }

        return "";
    }

    public verifyChangedSettledTickets(match: MatchDetail, query: object) {
        const request = this.requestService.getLastestResult(query).pipe(map((lastestMatch: Match) => {
            let needConfirm = false;
            if (_.isEqual(lastestMatch.matchDetail.ftStatus, TicketStatusText.calculated)
                && (!_.isEqual(match.finalHomeScore.toString(), lastestMatch.matchDetail.finalHomeScore?.toString())
                    || !_.isEqual(match.finalAwayScore.toString(), lastestMatch.matchDetail.finalAwayScore?.toString())
                    || lastestMatch.matchDetail.betStatus.includes('Refund'))) {
                needConfirm = true;
            }

            return needConfirm;
        }));

        return firstValueFrom(request);
    }

    public isFinalScoreConfirmed(matchDetail: MatchDetail) {
        return matchDetail.confirmFT > 0 && matchDetail.originalFinalHomeScore !== null
            && matchDetail.originalFinalAwayScore !== null;
    }

    public isExistInputScore(matchDetail: MatchDetail) {
        return matchDetail.finalHomeScore !== null && matchDetail.finalAwayScore !== null;
    }

    public isExistProviderScore(matchDetail: MatchDetail) {
        return matchDetail.exFTHomeScore !== null && matchDetail.exFTAwayScore !== null;
    }

    public isScoreSourceInsufficient(matchDetail: MatchDetail) {
        return !this.isFinalScoreConfirmed(matchDetail) && !this.isExistProviderScore(matchDetail);
    }

    public isScoreInconsistent(matchDetail: MatchDetail): boolean {
        const hasTraderScore = this.isFinalScoreConfirmed(matchDetail);
        const hasInputScore = this.isExistInputScore(matchDetail);
        const hasProviderScore = this.isExistProviderScore(matchDetail);

        if (hasInputScore) {
            return this.isInputScoreInconsistent(matchDetail, hasTraderScore, hasProviderScore);
        }

        if (hasTraderScore && hasProviderScore) {
            return this.isTraderProviderScoreInconsistent(matchDetail);
        }

        return false;
    }

    private isInputScoreInconsistent(matchDetail: MatchDetail, hasTraderScore: boolean, hasProviderScore: boolean): boolean {
        if (hasTraderScore && this.isInputTraderScoreInconsistent(matchDetail)) {
            return true;
        }

        if (hasProviderScore && this.isInputProviderScoreInconsistent(matchDetail)) {
            return true;
        }

        return false;
    }

    private isInputTraderScoreInconsistent(matchDetail: MatchDetail): boolean {
        return Number(matchDetail.finalHomeScore) !== matchDetail.originalFinalHomeScore
            || Number(matchDetail.finalAwayScore) !== matchDetail.originalFinalAwayScore;
    }

    private isInputProviderScoreInconsistent(matchDetail: MatchDetail): boolean {
        const mappedScore = this.getMappedScores(matchDetail);

        return Number(matchDetail.finalHomeScore) !== mappedScore.home
            || Number(matchDetail.finalAwayScore) !== mappedScore.away 
            || mappedScore.round !== matchDetail.betStatus;
    }

    private isTraderProviderScoreInconsistent(matchDetail: MatchDetail): boolean {
        const mappedScore = this.getMappedScores(matchDetail);

        return matchDetail.originalFinalHomeScore !== mappedScore.home
            || matchDetail.originalFinalAwayScore !== mappedScore.away
            || mappedScore.round !== matchDetail.betStatus;
    }

    private getMappedScores(matchDetail: MatchDetail): MappedScore {
        if (matchDetail.sportType === SportType.muayThai) {
            return this.mappedScoreService.getMappedScore(matchDetail.exFTHomeScore, matchDetail.exFTAwayScore);
        }

        return { 
            home: matchDetail.exFTHomeScore, 
            away: matchDetail.exFTAwayScore, 
            round: matchDetail.betStatus 
        };
    }
}