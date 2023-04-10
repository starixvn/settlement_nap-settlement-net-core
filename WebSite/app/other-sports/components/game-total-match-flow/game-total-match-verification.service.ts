import { Injectable } from "@angular/core";
import * as _  from 'lodash';
import { ResourcesIds } from "../../constants";
import { Match, MatchDetail } from "../../models";
import { RequestService } from "../../services/request.service";
import { firstValueFrom, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TicketStatusText } from "../../../shared/constants";
import { Language } from "../../../shared/language.native";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { GameTotalMatchService } from "./game-total-match.service";

@Injectable()
export class GameTotalMatchVerificationService {
    constructor(private readonly gameTotalMatchService: GameTotalMatchService,
        private readonly requestService: RequestService,){}

    public isScoreEmpty(homeValue: string, awayValue: string) {
        return homeValue === null || _.isEmpty(homeValue)
            || awayValue === null || _.isEmpty(awayValue);
    }

    public isScoreMismatched(result: ResultDetail, matchDetail: MatchDetail, originalResultDetail: ResultDetail) {
        const isExistTraderScore = this.isScoreConfirmed(matchDetail, originalResultDetail);
        const isExistProviderScore = this.isExistProviderScore(matchDetail);
        let isScoreMismatched = false;
        if (!this.isScoreEmpty(result.homeValue, result.awayValue)) {
            isScoreMismatched = this.compareInputScoreWithExternalScore(isExistTraderScore,
                    isExistProviderScore, matchDetail, originalResultDetail, result);
        } else if (isExistTraderScore && isExistProviderScore) {
            isScoreMismatched = (!_.isEqual(originalResultDetail.homeValue, matchDetail.exFTHomeScore.toString())
                || !_.isEqual(originalResultDetail.awayValue, matchDetail.exFTAwayScore.toString()));
        }

        result.isScoreMismatched = isScoreMismatched;
    }

    private compareInputScoreWithExternalScore(isExistTraderScore: boolean, isExistProviderScore: boolean, matchDetail: MatchDetail,
        originalResultDetail: ResultDetail, resultDetail: ResultDetail) {
        let isMismatched = false;
        if (isExistTraderScore) {
            isMismatched = !_.isEqual(resultDetail.homeValue, originalResultDetail.homeValue)
                || !_.isEqual(resultDetail.awayValue, originalResultDetail.awayValue);
        }

        if (!isMismatched && isExistProviderScore) {
            isMismatched = !_.isEqual(resultDetail.homeValue, matchDetail.exFTHomeScore.toString())
                || !_.isEqual(resultDetail.awayValue, matchDetail.exFTAwayScore.toString());
        }

        return isMismatched;
    }

    private isExistProviderScore(matchDetail: MatchDetail) {
        return !_.isNil(matchDetail.exFTHomeScore) && !_.isNil(matchDetail.exFTAwayScore);
    }

    public verifyCopyScore(matchDetail: MatchDetail) {
        if (matchDetail.isFullTimeSettled) {
            return Language.scoreSettledWarning;
        }

        if (this.isScoreEmpty(matchDetail.exFTHomeScore?.toString(), matchDetail.exFTAwayScore?.toString())) {
            return Language.missingScoreWarning;
        }

        return "";
    }

    public getResultDetailInAction(resultDetails: ResultDetail[], isScoreDirect: boolean) {
        if (isScoreDirect) {
            return _.filter(resultDetails, item => item.resourceId === ResourcesIds.totalSets);
        }

        return _.filter(resultDetails, item => !_.isEqual(item.resourceId, ResourcesIds.totalPoints));
    }

    public isScoreInvalid(resultDetails: ResultDetail[], isScoreDirect: boolean) {
        if (this.isExistEmptyScore(resultDetails)) {
            return Language.warningInputScore;
        }

        if (!isScoreDirect && this.isNotConsistentTotalSet(resultDetails)) {
            return Language.inconsistentValues;
        }

        return "";
    }

    private isExistEmptyScore(resultDetails: ResultDetail[]) {
        return _.find(resultDetails, (item) => this.isScoreEmpty(item.homeValue, item.awayValue));
    }

    public isNotConsistentTotalSet(resultDetails: ResultDetail[]) {
        const totalSet = _.find(resultDetails, (set: ResultDetail) => set.resourceId === ResourcesIds.totalSets);
        if (!totalSet || this.isScoreEmpty(totalSet.homeValue, totalSet.awayValue) || !this.atLeastSetHasValue(resultDetails)) {
            return false;
        } else {
            resultDetails = _.filter(resultDetails, item => item.resourceId !== ResourcesIds.totalSets);
            const computedTotalSets = new ResultDetail();
            this.gameTotalMatchService.computeTotalSets(resultDetails, computedTotalSets);
            return !_.isEqual(totalSet.homeValue, computedTotalSets.homeValue)
                || !_.isEqual(totalSet.awayValue, computedTotalSets.awayValue);
        }
    }

    private atLeastSetHasValue(resultDetails: ResultDetail[]) {
        const setsResult = _.filter(resultDetails, item => item.resourceId !== ResourcesIds.totalSets);
        return _.find(setsResult, item => !this.isScoreEmpty(item.homeValue, item.awayValue));
    }

    public verifyChangedSettledTickets(matchId: number, resultDetails: ResultDetail[], isScoreDirect: boolean) {
        const query = {
            matchId
        };
        const request =  this.requestService.getLastestResult(query).pipe(map((lastestMatch: Match) => {
            const matchDetail = lastestMatch.matchDetail;
            const statusCalculated = _.isEqual(matchDetail.ftStatus, TicketStatusText.calculated);
            return statusCalculated && (this.isTotalSetsChanged(resultDetails, lastestMatch)
                || this.compareScoreSets(resultDetails, lastestMatch.resultDetails, isScoreDirect));
        }));

        return firstValueFrom(request);
    }

    private compareScoreSets(resultDetails: ResultDetail[], lastestResults: ResultDetail[], isScoreDirect: boolean) {
        if (isScoreDirect) {
            return false;
        } else {
            let needConfirm = false;
            resultDetails = _.filter(resultDetails, item => !_.isEqual(item.resourceId, ResourcesIds.totalSets));
            _.forEach(resultDetails, (result) => {
                const correspondingResult = _.find(lastestResults, (item) => _.isEqual(item.resourceId, result.resourceId));
                if (correspondingResult && !_.isEqual(result.homeValue, correspondingResult.homeValue)
                    || !_.isEqual(result.awayValue, correspondingResult.awayValue)) {
                    needConfirm = true;
                }
            });
            return needConfirm;
        }
    }

    private isTotalSetsChanged(resultDetails: ResultDetail[], lastestMatch: Match) {
        const fulltimeResult = _.find(resultDetails, item => _.isEqual(item.resourceId, ResourcesIds.totalSets));
        const lastestFullTime = _.find(lastestMatch.resultDetails, item => _.isEqual(item.resourceId, ResourcesIds.totalSets));
        return !_.isEqual(fulltimeResult.homeValue, lastestFullTime.homeValue)
            || !_.isEqual(fulltimeResult.awayValue, lastestFullTime.awayValue)
            || lastestMatch.matchDetail.betStatus?.includes('Refund');
    }

    public isScoreConfirmed(matchDetail: MatchDetail, resultDetail: ResultDetail) {
        return matchDetail.confirmFT > 0 && !this.isScoreEmpty(resultDetail.homeValue, resultDetail.awayValue);
    }
}