import { Injectable } from "@angular/core";
import { ResourcesIds, ResultControlGroup } from "../constants";
import * as _ from 'lodash';
import { ExternalResultDetail, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ResultStatusId, ScoreSourceType } from "../../shared/constants";
import { EarlyConstraintService } from "./early-constraint.service";

@Injectable()
export class VerificationService  {

    public invalidInputScore(resultDetails: ResultDetail[]) {
        const findMap = _.find(resultDetails, item => _.isEmpty(item.homeValue) && item.resourceId !== ResourcesIds.final);
        const final = _.find(resultDetails, item => (_.isEmpty(item.homeValue) || _.isEmpty(item.awayValue))
            && item.resourceId === ResourcesIds.final);

        return !_.isNil(findMap) || !_.isNil(final);
    }

    public isSingleScoreMatched(map: ResultDetail, scoreToCompare: ExternalResultDetail, valueIsString : boolean) {
        if (!map.homeValue) {
            return _.every(map.externalScores, (result: ExternalResultDetail) =>
                _.isEmpty(result.homeValue) ||
                ((_.isEqual(Number(scoreToCompare.homeValue), Number(result.homeValue)) && !valueIsString)
                || (_.isEqual(scoreToCompare.homeValue.toUpperCase(), result.homeValue.toUpperCase()) && valueIsString))
            );
        }

        return _.every(map.externalScores, (result: ExternalResultDetail) =>
        _.isEmpty(result.homeValue) ||
           ((_.isEqual(Number(map.homeValue), Number(result.homeValue)) && !valueIsString)
           || (_.isEqual(map.homeValue, result.homeValue) && valueIsString )));
    }

    public isScoreMatched(map: ResultDetail, scoreToCompare: ExternalResultDetail) {
        if (!map.homeValue || !map.awayValue) {
            return _.every(map.externalScores, (result: ExternalResultDetail) =>
                (_.isEmpty(result.homeValue) || _.isEmpty(result.awayValue)) ||
                (_.isEqual(Number(scoreToCompare.homeValue), Number(result.homeValue)) &&
                    _.isEqual(Number(scoreToCompare.awayValue), Number(result.awayValue)))
            );
        }

        return _.every(map.externalScores, (result: ExternalResultDetail) =>
            (_.isEmpty(result.homeValue) || _.isEmpty(result.awayValue)) ||
            (_.isEqual(Number(map.homeValue), Number(result.homeValue)) &&
                _.isEqual(Number(map.awayValue), Number(result.awayValue)))
        );
    }


    private isExistedHomeAwayScore(homeValue: string, awayValue: string, coupleScores: boolean) {
        return !_.isEmpty(homeValue) && (coupleScores && !_.isEmpty(awayValue) || !coupleScores);
    }

    public isMismatchedWarning(map: ResultDetail, coupleScores: boolean, valueIsString = false){
        const correctScore = _.find(map.externalScores, (source) =>
                             this.isExistedHomeAwayScore(source.homeValue, source.awayValue, coupleScores));
        if (correctScore) {
            return coupleScores ? !this.isScoreMatched(map, correctScore) : !this.isSingleScoreMatched(map, correctScore, valueIsString);
        }

        return false;
    }

    public autoFillScore(map: ResultDetail, coupleScores: boolean) {
        if (map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted) {
            if (this.isExistScoreSources(map, coupleScores)) {
                const correctScore = _.find(map.externalScores, (source) =>
                    this.isExistedHomeAwayScore(source.homeValue, source.awayValue, coupleScores));
                if (!map.isScoreMismatched) {
                    map.homeValue = correctScore.homeValue;
                    map.awayValue = coupleScores ? correctScore.awayValue : '';
                    EarlyConstraintService.autoFillItemSelect(map, correctScore);
                }
            } else {
                map.homeValue = '';
                map.awayValue = '';
                EarlyConstraintService.autoFillItemSelect(map);
            }
        }
    }

    private isExistScoreSources(map: ResultDetail, coupleScores: boolean) {
        const providerScore = _.find(map.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot
            && this.isExistedHomeAwayScore(source.homeValue, source.awayValue, coupleScores));
        const outsideScore = _.find(map.externalScores, (source) => source.sourceId === ScoreSourceType.screenshot
            && this.isExistedHomeAwayScore(source.homeValue, source.awayValue, coupleScores));

        return providerScore && outsideScore;
    }

    public allMapHaveScoreSources(resultDetails: ResultDetail[]) {
        const findMap = resultDetails.filter((map: ResultDetail) => map.checked);
        let result = true;
        _.forEach(findMap, (map) => {
            if (!this.isExistScoreSources(map, map.resourceId === ResourcesIds.final)) {
                result = false;
            }
        });

        return result;
    }

    public allMapHaveScreenshotSource(resultDetails: ResultDetail[]) {
        const checkedResults = resultDetails.filter((result: ResultDetail) => result.checked);
        let result = true;
        _.forEach(checkedResults, (map) => {
            if (!this.isExistScoreSources(map, map.resourceId === ResourcesIds.final) && !this.isExistScreenshotSource(map)) {
                result = false;
            }
        });

        return result;
    }

    
    public isExistScreenshotSource(map: ResultDetail) {
        const outsideScore = _.find(map.externalScores, (source) => source.sourceId === ScoreSourceType.screenshot && !_.isEmpty(source.homeValue));
        return outsideScore;
    }


    public isExistInhouseResult(result: ResultDetail) {
        return (result.inputType === ResultControlGroup.CoupleScores)
            ? _.find(result.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot
                && this.isExistedHomeAwayScore(source.homeValue, source.awayValue, true))
            : _.find(result.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot && !_.isEmpty(source.homeValue));
    }

    public allResultsHaveScoreSources(resultDetails: ResultDetail[]) {
        const checkedResults = resultDetails.filter((result: ResultDetail) => result.checked);
        let allResultsHaveScoreSources = true;
        _.forEach(checkedResults, (result) => {
            const isCoupleScore = result.groupBetType === ResultControlGroup.CoupleScores;
                if (!this.isExistScoreSources(result, isCoupleScore)) {
                    allResultsHaveScoreSources = false;
                }
        });

        return allResultsHaveScoreSources;
    }

    public isDisableUncalculate(resultDetails: ResultDetail[]) {
        return _.every(resultDetails, (result) => !result.checked);
    }

    public isExistMismatchedScoreScreenshot(resultDetails: ResultDetail[]) {
        let isFlag = false;
        resultDetails.forEach((map) => {
            if (map.checked && this.isMismatchedScoreScreenshot(map)) {
                isFlag = true;
            }
        });

        return isFlag;
    }

    public isMismatchedScoreScreenshot(map: ResultDetail) {  
        const screenshotScore = map.externalScores.find(x => x.sourceId === ScoreSourceType.screenshot);
        if(_.isEmpty(screenshotScore?.homeValue)) {
             return false;
        }

        if(this.isExistedHomeAwayScore(map.homeValue,map.awayValue,true) || this.isExistedHomeAwayScore(screenshotScore.homeValue,screenshotScore.awayValue,true)) {
            return (!_.isEqual(map.homeValue,screenshotScore?.homeValue) || !_.isEqual(map.awayValue,screenshotScore?.awayValue));
        }

        if((!_.isEmpty(screenshotScore?.homeValue) && _.isEmpty(screenshotScore?.awayValue)) 
            || (!_.isEmpty(map.homeValue) && _.isEmpty(map.awayValue))) {
            return !_.isEqual(map.homeValue,screenshotScore?.homeValue)
        }
        
        return false;
    }

    public isValidTraderConfirmScore(result: ResultDetail) {
        const traderScore = result.externalScores.find((source) => source.sourceId === ScoreSourceType.trader);

        return traderScore 
            && !_.isEmpty(traderScore.homeValue) 
            && !_.isEmpty(traderScore.awayValue);
    }
}