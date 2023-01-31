import { Injectable } from '@angular/core';
import { Match, MatchDetail } from '../../models';
import * as _ from 'lodash';
import { SportType, TicketStatusText } from '../../../shared/constants';
import { Language } from '../../../shared/language';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { RequestService } from '../..//services/request.service';
@Injectable()
export class FullTimeVerificationService {

    constructor(private readonly requestService: RequestService) {
    }

    public checkScoreMuayThai(matchDetail: MatchDetail) {
        if(matchDetail.sportType !== SportType.muayThai) {
            return '';
        }

        const finalScore = `${matchDetail.finalHomeScore}-${matchDetail.finalAwayScore}`;
        if (finalScore.length > 3 || (finalScore.indexOf("1-0") === -1 && finalScore.indexOf("0-1") === -1 &&
            finalScore.indexOf("3-0") === -1 && finalScore.indexOf("0-3") === -1 && finalScore.indexOf("3-3") === -1 &&
            finalScore.indexOf("5-0") === -1 && finalScore.indexOf("0-5") === -1 && finalScore.indexOf("5-5") === -1)) {
            return "Please input the correct Final Score.";
        }

        const sum = Number(matchDetail.finalHomeScore) + Number(matchDetail.finalAwayScore);
        if (_.isEmpty(matchDetail.betStatus) && sum === 1) {
            return "Please input the correct 'KO at Round'";
        }

        return '';
    }

    public verifyCopyScore(matchDetail: MatchDetail) {
        if (matchDetail.isFullTimeSettled) {
            return Language.scoreSettledWarning;
        }

        if(_.isEmpty(matchDetail.exFTHomeScore?.toString()) || _.isEmpty(matchDetail.exFTAwayScore?.toString())) {
            return Language.missingScoreWarning;
        }

        return "";
    }

    public verifyChangedSettledTickets(match: MatchDetail, query: object) : Observable<boolean> {
        return this.requestService.getLastestResult(query).pipe(map((lastestMatch: Match) => {
            let needConfirm = false;
            if (_.isEqual(lastestMatch.matchDetail.ftStatus, TicketStatusText.calculated)
                && (!_.isEqual(match.finalHomeScore.toString(), lastestMatch.matchDetail.finalHomeScore?.toString())
                || !_.isEqual(match.finalAwayScore.toString(), lastestMatch.matchDetail.finalAwayScore?.toString())
                || lastestMatch.matchDetail.betStatus.includes('Refund'))) {
                needConfirm = true;
            }

            return needConfirm;
        }));
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

    public isScoreInconsistent(matchDetail: MatchDetail) {
        const isExistTraderScore = this.isFinalScoreConfirmed(matchDetail);
        const isExistInputScore = this.isExistInputScore(matchDetail);
        const isExistProviderScore = this.isExistProviderScore(matchDetail);
        let isInconsistent = false;
        if (isExistInputScore) {
          if (isExistTraderScore) {
            isInconsistent = Number(matchDetail.finalHomeScore) !== matchDetail.originalFinalHomeScore
             || Number(matchDetail.finalAwayScore) !== matchDetail.originalFinalAwayScore;
          }

          if (!isInconsistent && isExistProviderScore) {
            isInconsistent = Number(matchDetail.finalHomeScore) !== matchDetail.exFTHomeScore
             || Number(matchDetail.finalAwayScore) !== matchDetail.exFTAwayScore;
          }
        } else if (isExistTraderScore && isExistProviderScore) {
          isInconsistent = matchDetail.originalFinalHomeScore !== matchDetail.exFTHomeScore
           || matchDetail.originalFinalAwayScore !== matchDetail.exFTAwayScore;
        }

        return isInconsistent;
    }
}