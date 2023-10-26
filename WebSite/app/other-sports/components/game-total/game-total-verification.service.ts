import { Injectable } from "@angular/core";
import { ResourcesIds } from "../../constants";
import { ExternalResultDetail, ResultDetail, MatchDetail } from "../../../shared/models/sportsbook-sop";
import { GameTotalService } from "./game-total.service";
import { Language } from "../../../shared/language.native";
import { GeneralResultDetail } from "../../../shared/models";
import * as _ from 'lodash';
import { IntervalBackgroundPipe } from "../../../shared/pipes/interval-background.pipe";
import { MatchAio } from "../../models";
import { ResourceIds, ResultStatusId } from "../../../shared/constants";
import { ChildMatch } from "../../models/child-match.model";
import { iif } from "rxjs";

@Injectable()
export class GameTotalVerificationService {
    constructor(private readonly gameTotalService: GameTotalService,
        private readonly intervalBackgroundPipe: IntervalBackgroundPipe) {
    }

    public isNotConsistentTotalSet(resultDetails: ResultDetail[]) {
        const totalSet = _.find(resultDetails, (map: ResultDetail) => map.resourceId === ResourcesIds.totalSets);
        if (!totalSet || this.isEmptyHomeOrAwayValue(totalSet) || !this.atLeastSetHasValue(resultDetails)) {
            return false;
        } else {
            resultDetails = _.filter(resultDetails, item => item.resourceId !== ResourcesIds.totalSets);
            const computeTotalSets = this.gameTotalService.computeTotalSets(resultDetails);
            return !_.isEqual(totalSet.homeValue, computeTotalSets.homeValue)
                || !_.isEqual(totalSet.awayValue, computeTotalSets.awayValue);
        }
    }

    private atLeastSetHasValue(resultDetails: ResultDetail[]) {
        const setsResult = _.filter(resultDetails, item => item.resourceId !== ResourcesIds.totalSets);
        return _.find(setsResult, item => !this.isEmptyHomeOrAwayValue(item));
    }

    public isEmptyHomeOrAwayValue(item: GeneralResultDetail) {
        return item.homeValue === null || _.isEmpty(item.homeValue)
            || item.awayValue === null || _.isEmpty(item.awayValue);
    }

    public isEmptyScore(resultDetails: ResultDetail[]) {
        const isEmpty = _.filter(resultDetails, item => this.isEmptyHomeOrAwayValue(item)).length > 0;
        if (isEmpty) {
            return true;
        }
        return false;
    }

    public getResultDetailToAction(resultDetails: ResultDetail[], inputDirectly: boolean) {
        if (inputDirectly) {
            return _.filter(resultDetails, item => item.resourceId === ResourcesIds.totalSets);
        }
        return resultDetails;
    }

    public getClassWithScore(resultDetails: ResultDetail[], match: MatchAio) {
        resultDetails.forEach(item => {
            item.className = !match.isScoreDirect && _.isEqual(item.resourceId, ResourcesIds.totalSets)
                && this.isNotConsistentTotalSet(match.resultDetails)
                ? "not-consistent"
                : this.intervalBackgroundPipe.transform(item.settlementStatusId);
        });
    }

    public verifyCopyScore(externalResult: ExternalResultDetail, totalSet: ResultDetail) {
        if (totalSet.resultStatusId === ResultStatusId.ManualCompleted || totalSet.resultStatusId === ResultStatusId.AutoCompleted) {
            return Language.scoreSettledWarning;
        }

        if (_.isEmpty(externalResult.homeValue?.toString()) || _.isEmpty(externalResult.awayValue?.toString())) {
            return Language.missingScoreWarning;
        }

        return "";
    }

    public verifyCopyScoreNew(externalResults: ExternalResultDetail[], totalSet: ResultDetail) {
        if (totalSet.resultStatusId === ResultStatusId.ManualCompleted || totalSet.resultStatusId === ResultStatusId.AutoCompleted) {
            return Language.scoreSettledWarning;
        }

        if (_.every(externalResults, externalResult => _.isEmpty(externalResult.homeValue?.toString()) || _.isEmpty(externalResult.awayValue?.toString()))) {
            return Language.missingScoreWarning;
        }


        return "";
    }

    public verifyConsistentChildMatch(resultDetails: ResultDetail[], childMatch: ChildMatch[]) {
        if (childMatch.length > 0) {
            const notConsistent = _.find(childMatch, item => this.isNotConsistent(resultDetails, item));
            return !_.isNil(notConsistent);
        }
        return false;
    }

    public isNotConsistent(resultDetails: ResultDetail[], childMatch: ChildMatch) {
        const resultRelated = _.find(resultDetails, item => item.resourceId === childMatch.relatedResourceId);
        const homeValue = _.isEmpty(resultRelated.homeValue) ? null : resultRelated.homeValue;
        const awayValue = _.isEmpty(resultRelated.awayValue) ? null : resultRelated.awayValue;

        return !resultRelated || !_.isEqual(homeValue, childMatch.homeValue) || !_.isEqual(awayValue, childMatch.awayValue);
    }

    public isScoreMismatched(resultDetails: ResultDetail[], externalResults: ExternalResultDetail[],
        originalResultDetails: ResultDetail[], matchDetail: MatchDetail) {
            const hasTrader = this.hasTraderConfirmed(matchDetail,originalResultDetails);
            const hasProvider = this.hasProvider(externalResults);

            if(hasProvider) {
                console.log('hasProvider')
                if(hasTrader) {
                    _.forEach(resultDetails, result => {
                        const providerResult = externalResults.find(x => x.resourceId === result.resourceId);
                        const originalResult = originalResultDetails.find(x => x.resourceId === result.resourceId)
         
                        result.isScoreMismatched = providerResult && originalResult && (!_.isEqual(providerResult.homeValue ?? "", originalResult.homeValue ?? "")
                        || !_.isEqual(providerResult.awayValue ?? "", originalResult.awayValue ?? ""))
                    });
                }

                if(resultDetails.some(x => x.isScoreMismatched)) {
                    return;
                }
                this.compareInputScoreWithProviderScores(resultDetails, externalResults);
                return;
            }
           
            if(hasTrader) {
                console.log('hasTrader')
                this.compareInputScoreTraderScores(originalResultDetails,resultDetails);
            }
    }

    private compareInputScoreWithProviderScores(resultDetails: ResultDetail[], externalResults: ExternalResultDetail[]) {
        _.forEach(resultDetails, result => {
            const providerResult = externalResults.find(x => x.resourceId === result.resourceId);

            result.isScoreMismatched = providerResult  && !this.isEmptyHomeOrAwayValue(result) 
                && (!_.isEqual(providerResult.homeValue, result.homeValue) || !_.isEqual(providerResult.awayValue, result.awayValue)) && !this.acceptCaseZero(providerResult,result);
        });
    }

    private compareInputScoreTraderScores(originalResultDetails: ResultDetail[], resultDetails: ResultDetail[]) {
        _.forEach(resultDetails, result => {
                const originalResult = originalResultDetails.find(x => x.resourceId === result.resourceId)
                result.isScoreMismatched = originalResult && !this.isEmptyHomeOrAwayValue(result) && (!_.isEqual(result.homeValue, originalResult.homeValue)
                    || !_.isEqual(result.awayValue, originalResult.awayValue)) 
                    && !this.acceptCaseZero(originalResult,result);
        })
    }

    private acceptCaseZero(orinalResult: GeneralResultDetail, result: ResultDetail) {
       return (result.awayValue === "0" && result.homeValue === "0" && _.isEmpty(orinalResult.homeValue) && _.isEmpty(orinalResult.awayValue));
    }

    public isScoreConfirmed(matchDetail: MatchDetail, resultDetail: ResultDetail) {
        return matchDetail.confirmFT > 0 && !this.isEmptyHomeOrAwayValue(resultDetail);
    }

    private compareInputScoreWithExternalScore(isExistTraderScore: boolean, isExistProviderScore: boolean, matchDetail: MatchDetail,
        originalResultDetail: ResultDetail, resultDetail: ResultDetail, externalResult: ExternalResultDetail) {
        let isMismatched = false;
        if (isExistTraderScore) {
            isMismatched = !_.isEqual(resultDetail.homeValue, originalResultDetail.homeValue)
                || !_.isEqual(resultDetail.awayValue, originalResultDetail.awayValue);
        }

        if (!isMismatched && isExistProviderScore) {
            isMismatched = !_.isEqual(resultDetail.homeValue, externalResult.homeValue.toString())
                || !_.isEqual(resultDetail.awayValue, externalResult.awayValue.toString());
        }

        return isMismatched;
    }

    public isInsufficient(matchDetail: MatchDetail,originalResultDetails: ResultDetail[],externalResults: ExternalResultDetail[]) {
        const originalTotalSetResultDetail = originalResultDetails.find(r => r.resourceId === ResourcesIds.totalSets);
        return  (matchDetail.confirmFT < 1 || this.isEmptyHomeOrAwayValue(originalTotalSetResultDetail)) && !externalResults?.length;
    }

    public hasTraderConfirmed(matchDetail: MatchDetail,originalResultDetails: ResultDetail[]) {
        const originalTotalSetResultDetail = originalResultDetails.find(r => r.resourceId === ResourcesIds.totalSets);
        return this.isScoreConfirmed(matchDetail,originalTotalSetResultDetail);
    }

    public hasProvider(externalResults: ExternalResultDetail[]) {
        return externalResults?.length;
        // && _.some(externalResults, x => !this.isEmptyHomeOrAwayValue(x));
    }


    public isConsidentScore(originalResultDetails: ResultDetail[],externalResults: ExternalResultDetail[],resultDetails: ResultDetail[],matchDetail: MatchDetail) {
        if(this.hasProvider(externalResults)) {
            return this.isConsidentScoreProvider(resultDetails,externalResults);
    //   || this.isConsidentScoreTraderConfirm(originalResultDetails,resultDetails);
        }
        
        if(this.hasTraderConfirmed(matchDetail,originalResultDetails)) {
            return this.isConsidentScoreTraderConfirm(originalResultDetails,resultDetails);
        }
    }
   
    public isConsidentScoreTraderConfirm(originalResultDetails: ResultDetail[], resultDetails: ResultDetail[]) {
        return resultDetails.some(result => {
            const originalResult = originalResultDetails?.find(x => x.resourceId === result.resourceId);
            return originalResult && (!_.isEqual(result.homeValue ?? "", originalResult.homeValue ?? "")
                || !_.isEqual(result.awayValue ?? "", originalResult.awayValue ?? ""))
                && !this.acceptCaseZero(originalResult,result);
        })
    }

    public isConsidentScoreProvider(resultDetails: ResultDetail[], externalResults: ExternalResultDetail[]) {
        return resultDetails.some(result => {
            const providerResult = externalResults?.find(x => x.resourceId === result.resourceId);
            return providerResult && (!_.isEqual(providerResult.homeValue ?? "", result.homeValue ?? "") 
                || !_.isEqual(providerResult.awayValue ?? "", result.awayValue ?? ""))
                && !this.acceptCaseZero(providerResult,result);
        })
    }
}