import * as _ from 'lodash';
import { Injectable, PipeTransform } from "@angular/core";
import { ExternalResultDetail, ResultDetail, GeneralMatch, ExternalResult, MatchDetail } from "../../shared/models/sportsbook-sop";
import { ResultStatusId, TicketStatusText, ScoreSourceType, SettlementStatusId, SportType } from "../../shared/constants";
import { Language } from "../../shared/language.native";
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { GeneralResultDetail } from '../../shared/models';

@Injectable()
export class VerificationBaseService {
    constructor(protected resultByTeamNamePipe: ResultByTeamNamePipe) {
    }

    public invalidInputScore(resultDetails: ResultDetail[], isScoreDirect: boolean, totalGames: string) {
        const findMap = _.find(resultDetails, (map: ResultDetail) =>
            _.isEmpty(map.homeValue) || _.isEmpty(map.awayValue));

        const total = _.find(resultDetails, (map: ResultDetail) =>
            map.resourceId === totalGames
            && Number(map.homeValue) === 0
            && Number(map.awayValue) === 0);

        return findMap || (total && !isScoreDirect);
    }

    public getCalculationConfirmMessage(resultDetails: ResultDetail[], pipe: PipeTransform) {
        let confirmMessage = `${Language.CalculationConfirmMessage}<br/>${Language.CalculationAdditionalConfirmation}<br/>`;
        resultDetails.forEach((x: ResultDetail) => {
            const resourceName = pipe.transform(x.resourceId);
            const value = `${x.homeValue ? x.homeValue : 0}-${x.awayValue ? x.awayValue : 0}`;
            confirmMessage += `${resourceName}: ${value}<br/>`;
        });

        return confirmMessage;
    }

    public isTicketOnGame(resultDetails: ResultDetail[], resourcesIdsTotal: string, resourcesIdsMatch: string) {
        return _.filter(resultDetails, (item) => !_.isEqual(item.resourceId, resourcesIdsMatch)
            && !_.isEqual(item.resourceId, resourcesIdsTotal)
            && item.ticketStatus !== TicketStatusText.noTicket
            || (_.isEqual(item.resourceId, resourcesIdsMatch) && item.isSpecialBettype)).length > 0;
    }

    public isExistMismatchScore(resultDetails: ResultDetail[]) {
        let isFlag = false;
        resultDetails.forEach((map) => {
            if (map.isScoreMismatched && map.checked) {
                isFlag = true;
            }
        });

        return isFlag;
    }

    public allMapHaveScoreSources(resultDetails: ResultDetail[]) {
        let result = true;
        _.forEach(resultDetails, (map) => {
            if (!this.isExistScoreSources(map)) {
                result = false;
            }
        });

        return result;
    }

    public isExistScoreSources(map: ResultDetail) {
        const providerScore = _.find(map.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot
            && this.isExistedHomeAwayScore(source.homeValue, source.awayValue));
        const outsideScore = _.find(map.externalScores, (source) => source.sourceId === ScoreSourceType.screenshot
            && this.isExistedHomeAwayScore(source.homeValue, source.awayValue));

        return providerScore && outsideScore;
    }

    public allMapHaveScreenshotSource(resultDetails: ResultDetail[]) {
        const checkedResults = resultDetails.filter((result: ResultDetail) => result.checked);
        let result = true;
        _.forEach(checkedResults, (map) => {
            if (!this.isExistScreenshotSource(map)) {
                result = false;
            }
        });

        return result;
    }

    public isExistScreenshotSource(map: ResultDetail) {
        const outsideScore = _.find(map.externalScores, (source) => source.sourceId === ScoreSourceType.screenshot && (!_.isEmpty(source.homeValue) || !_.isEmpty(source.awayValue)));
        return outsideScore;
    }

    public isExistedHomeAwayScore(homeValue: string, awayValue: string) {
        return !_.isEmpty(homeValue) && !_.isEmpty(awayValue);
    }

    public hasScore(resultDetail: GeneralResultDetail) {
        return resultDetail &&  !_.isEmpty(resultDetail.homeValue) && !_.isEmpty(resultDetail.awayValue);
    }

    public autoFillScore(map: ResultDetail) {
        if (map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted) {
            if (this.isExistScoreSources(map)) {
                const correctScore = _.find(map.externalScores, (source) =>
                    this.isExistedHomeAwayScore(source.homeValue, source.awayValue));
                if (map.isScoreMismatched) {
                    map.homeValue = '';
                    map.awayValue = '';
                } else {
                    map.homeValue = correctScore.homeValue;
                    map.awayValue = correctScore.awayValue;
                }
            } else {
                map.homeValue = '';
                map.awayValue = '';
            }
        }
    }

    public autoFillScreenShotScore(map: ResultDetail) {
        if (map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted) {
            if (this.isExistScoreSources(map)) {
                const correctScore = _.find(map.externalScores, (source) =>
                    this.isExistedHomeAwayScore(source.homeValue, source.awayValue) && source.sourceId === ScoreSourceType.screenshot);
                if (map.isScoreMismatched) {
                    map.homeValue = '';
                    map.awayValue = '';
                } else {
                    map.homeValue = correctScore.homeValue;
                    map.awayValue = correctScore.awayValue;
                }
            } else {
                map.homeValue = '';
                map.awayValue = '';
            }
        }
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

        if(this.hasScore(map) || this.hasScore(screenshotScore)) {
            return !(_.isEmpty(map.homeValue) && _.isEmpty(map.awayValue)) && !(_.isEmpty(screenshotScore.homeValue) && _.isEmpty(screenshotScore.awayValue))
                && (!_.isEqual(map.homeValue,screenshotScore?.homeValue) || !_.isEqual(map.awayValue,screenshotScore.awayValue));
        }

        if((!_.isEmpty(screenshotScore.homeValue) && _.isEmpty(screenshotScore?.awayValue)) 
            || (!_.isEmpty(map.homeValue) && _.isEmpty(map.awayValue))) {
            return !_.isEmpty(map.homeValue) && !_.isEqual(map.homeValue,screenshotScore.homeValue)
        }
        
        return false;
    }

    public isScoreConsecutive(resultDetails: GeneralResultDetail[], firstResourceId: string) {
        if (resultDetails.length === 1) {
            return false;
        }

        return _.every(resultDetails, (map) =>
            _.find(resultDetails, (resultDetail) => Number(resultDetail.resourceId) === Number(map.resourceId) - 1)
            || map.resourceId === firstResourceId);
    }

    public isOutsideScoreConsecutive(externalScores: ExternalResultDetail[], firstResourceId: string) {
        if (externalScores.length === 1) {
            return false;
        }

        return _.every(externalScores, (score) =>
            _.find(externalScores, (previousScore) => Number(previousScore.resourceId) === Number(score.resourceId) - 1)
            || score.resourceId === firstResourceId);
    }

    public isMismatchedWarning(map: ResultDetail) {
        const correctScore = _.find(map.externalScores, (source) => this.isExistedHomeAwayScore(source.homeValue, source.awayValue));
        if (correctScore) {
            return !this.isScoreMatched(map, correctScore);
        }

        return false;
    }

    private isScoreMatched(map: ResultDetail, scoreToCompare: ExternalResultDetail) {
        if (!map.homeValue || !map.awayValue) {
            return _.every(map.externalScores, (result: ExternalResultDetail) =>
                (_.isEmpty(result.homeValue) || _.isEmpty(result.awayValue)) ||
                (_.isEqual(scoreToCompare.homeValue, result.homeValue) &&
                    _.isEqual(scoreToCompare.awayValue, result.awayValue))
            );
        }

        return _.every(map.externalScores, (result: ExternalResultDetail) =>
            (_.isEmpty(result.homeValue) || _.isEmpty(result.awayValue)) ||
            (_.isEqual(map.homeValue, result.homeValue) &&
                _.isEqual(map.awayValue, result.awayValue))
        );
    }

    public verifyFinalResource(resultDetails: ResultDetail[], resourcesIdFinal: string, newFinal: string, totalScore: string) {
        const final = resultDetails.find((map) => _.isEqual(map.resourceId, resourcesIdFinal) && map.checked
            && map.homeValue && map.awayValue);
        if (final) {
            const oldScore = `${final.homeValue}-${final.awayValue}`;

            if (!_.isEmpty(newFinal) && !_.isEqual(newFinal, oldScore)) {
                return Language.TotalScoreNotMatchConfirmation
                    .replace(/TOTAL_SCORE/g, totalScore)
                    .replace(/OLD_SCORE/g, oldScore)
                    .replace(/NEW_SCORE/g, newFinal);
            }
        }
        return "";
    }

    public changeToNewFinalResource(oldFinal: ResultDetail, newFinal: string) {
        const scoreList = newFinal.split('-');
        oldFinal.homeValue = scoreList[0];
        oldFinal.awayValue = scoreList[1];
        oldFinal.isScoreMismatched = this.isMismatchedWarning(oldFinal);
    }

    public getNewFinalResource(resultDetails: ResultDetail[], resourcesIdFinal: string, isSumScore: boolean) {
        const maps = resultDetails.filter((map) => !_.isEqual(map.resourceId, resourcesIdFinal)
            && this.isExistedHomeAwayScore(map.homeValue, map.awayValue));
        let newHomeScore: number;
        let newAwayScore: number;
        if (_.isEmpty(maps)) {
            return "";
        }
        if (isSumScore) {
            newHomeScore = _.sumBy(maps, (map) => Number(map.homeValue));
            newAwayScore = _.sumBy(maps, (map) => Number(map.awayValue));
        } else {
            newHomeScore = _.countBy(maps, (map) => Number(map.homeValue) > Number(map.awayValue)).true ?? 0;
            newAwayScore = _.countBy(maps, (map) => Number(map.homeValue) < Number(map.awayValue)).true ?? 0;
        }

        return `${newHomeScore}-${newAwayScore}`;
    }

    public isEarlyMismatchedWarning(map: ResultDetail) {
        const correctScore = _.find(map.externalScores, (source) => !_.isEmpty(source.homeValue));
        if (correctScore) {
            return !this.isEarlyResultMatched(map, correctScore);
        }

        return false;
    }

    private isEarlyResultMatched(result: ResultDetail, scoreToCompare: ExternalResultDetail) {
        if (!result.homeValue) {
            return _.every(result.externalScores, (externalResult: ExternalResultDetail) =>
                _.isEmpty(externalResult.homeValue) ||
                _.isEqual(scoreToCompare.homeValue, externalResult.homeValue)
            );
        }
        
        return _.every(result.externalScores, (externalResult: ExternalResultDetail) =>
            _.isEmpty(externalResult.homeValue) ||
            _.isEqual(result.homeValue, externalResult.homeValue)
        );
    }

    public autoFillEarlyResult(result: ResultDetail) {
        if (result.resultStatusId !== ResultStatusId.ManualCompleted && result.resultStatusId !== ResultStatusId.AutoCompleted) {
            if (this.isExistEarlyResultSources(result) && !this.isEarlyMismatchedWarning(result)) {
                const correctScore = _.find(result.externalScores, (source) => !_.isEmpty(source.homeValue));
                result.homeValue = correctScore.homeValue;
            } else {
                result.homeValue = '';
            }
        }
    }

    public isExistEarlyResultSources(result: ResultDetail) {
        const providerResult = _.find(result.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot
            && !_.isEmpty(source.homeValue));
        const outsideResult = _.find(result.externalScores, (source) => source.sourceId === ScoreSourceType.screenshot
            && !_.isEmpty(source.homeValue));

        return providerResult && outsideResult;
    }

    public allResultsHaveScoreSources(resultDetails: ResultDetail[]) {
        const checkedResults = resultDetails.filter((result: ResultDetail) => result.checked);
        let allResultsHaveScoreSources = true;
        _.forEach(checkedResults, (result) => {
            if (!this.isExistEarlyResultSources(result)) {
                allResultsHaveScoreSources = false;
            }
        });

        return allResultsHaveScoreSources;
    }

    public enableUncalculateButton(resultDetails: ResultDetail[]) {
        return _.filter(resultDetails, (map) => map.settlementStatusId !== SettlementStatusId.Running).length > 0;
    }

    public isFullTimeMismatched(resultDetails: ResultDetail[], isScoreDirect: boolean, resourcesIdFinal: string, isSumScore: boolean) {
        const final = resultDetails.find((map) => _.isEqual(map.resourceId, resourcesIdFinal)
            && map.homeValue && map.awayValue);
        const maps = resultDetails.filter((map) => !_.isEqual(map.resourceId, resourcesIdFinal)
            && this.isExistedHomeAwayScore(map.homeValue, map.awayValue));
        if (final && maps.length > 0 && !isScoreDirect) {
            return this.checkMismatchFinalResource(final, maps, isSumScore);
        }
        return false;
    }

    private checkMismatchFinalResource(finalResource: ResultDetail, maps: ResultDetail[], isSumScore: boolean) {
        let totalHome: number;
        let totalAway: number;
        if (isSumScore) {
            totalHome = _.sumBy(maps, (map) => Number(map.homeValue));
            totalAway = _.sumBy(maps, (map) => Number(map.awayValue));

        } else {
            totalHome = _.countBy(maps, (map) => Number(map.homeValue) > Number(map.awayValue)).true ?? 0;
            totalAway = _.countBy(maps, (map) => Number(map.homeValue) < Number(map.awayValue)).true ?? 0;
        }

        return !_.isEqual(finalResource.homeValue, totalHome.toString()) || !_.isEqual(finalResource.awayValue, totalAway.toString());
    }

    public getChangedScores(resultDetails: ResultDetail[], originalResultDetails: ResultDetail[]) {
        let outsideScores: ExternalResultDetail[] = [];
        const mapsChecked = resultDetails.filter((map) => map.checked);
        _.forEach(mapsChecked, (map) => {
            const currentSources = map.externalScores.filter((source) => source.sourceId >= ScoreSourceType.screenshot);
            const originalMap = originalResultDetails.find((item) => _.isEqual(item.resourceId, map.resourceId));
            const originalSources = originalMap.externalScores.filter((source) => source.sourceId >= ScoreSourceType.screenshot);
            const changedScores = _.differenceWith(currentSources, originalSources, _.isEqual);
            if (changedScores.length > 0) {
                outsideScores = outsideScores.concat(changedScores);
            }
        });

        return outsideScores;
    }

    public getOutsideScores(resultDetails: ResultDetail[]) {
        const outsideScores: ExternalResultDetail[] = [];
        const mapsChecked = resultDetails.filter((map) => map.checked);
        _.forEach(mapsChecked, (map) => {
            const mapScore = new ExternalResultDetail(0, map.resourceId, '', '', map.homeValue, map.awayValue);
            outsideScores.push(mapScore);
            _.forEach(map.externalScores, (score) => {
                if (score.sourceId > ScoreSourceType.emptySource) {
                    outsideScores.push(score);
                }
            });
        });

        return outsideScores;
    }

    public generateExternalScores(match: GeneralMatch, resultDetails: ResultDetail[], sportType: number) {
        const listGroupExternalResult = this.groupExternalResult(match.externalResults, sportType);
        const newSportsSOP = [SportType.tennis, SportType.cricket, SportType.badminton, SportType.basketBall, SportType.volleyBall, SportType.beachVolleyball, SportType.eSports];
        _.forEach(resultDetails, (map: ResultDetail) => {
            const scores: ExternalResultDetail[] = [];
            _.forEach(listGroupExternalResult, (result: ExternalResult) => {
                const score = result.resultDetails.find((item) => _.isEqual(item.resourceId, map.resourceId));
                if (_.isNil(score)) {
                    if (result.sourceId === ScoreSourceType.trader && (newSportsSOP.includes(sportType))
                        && !_.isEqual(map.resultStatus, "Refund")
                        && (!_.isEmpty(map.homeValue) || !_.isEmpty(map.awayValue))
                        && !_.isEqual(map.settlementStatusId, SettlementStatusId.RefundSettleDetermined)
                        && !_.isEqual(map.settlementStatusId, SettlementStatusId.Refund)
                        ) {
                        const tempScore = new ExternalResultDetail(result.sourceId, map.resourceId, result.sourceName, result.remark);
                        tempScore.homeValue = map.homeValue;
                        tempScore.awayValue = map.awayValue;
                        tempScore.homeName = this.resultByTeamNamePipe.transform(tempScore.homeValue, match.matchDetail, map.groupBetType);
                        tempScore.awayName = this.resultByTeamNamePipe.transform(tempScore.awayValue, match.matchDetail, map.groupBetType);
                        tempScore.fromResultDetail = true;
                        scores.push(tempScore);
                    } else {
                        scores.push(new ExternalResultDetail(result.sourceId, map.resourceId, result.sourceName, result.remark));
                    }
                } else {
                    score.homeName = this.resultByTeamNamePipe.transform(score.homeValue, match.matchDetail, map.groupBetType);
                    score.awayName = this.resultByTeamNamePipe.transform(score.awayValue, match.matchDetail, map.groupBetType);
                    scores.push(score);
                }
            });

            map.externalScores = scores;
        });
    }

    private groupExternalResult(externalResults: ExternalResult[], sportType: number) {
        let listProvidersScore: ExternalResult[] = [];
        listProvidersScore.push(this.traderScore(externalResults));
        listProvidersScore = _.concat(listProvidersScore, this.providersScore(externalResults));
        return _.concat(listProvidersScore, this.outSidesScore(externalResults));
    }

    private traderScore(externalResults: ExternalResult[]) {
        const traderScore = _.find(externalResults, (item: ExternalResult) => item.sourceId === ScoreSourceType.trader);
        if (traderScore) {
            return traderScore;
        } else {
            return new ExternalResult(ScoreSourceType.trader, []);
        }
    }

    private providersScore(externalResults: ExternalResult[]) {
        const maximumProviders = 3;
        const listProvidersScore: ExternalResult[] = [];
        const providersScore = _.filter(externalResults, (item: ExternalResult) =>
            item.sourceId !== ScoreSourceType.trader && item.sourceId < ScoreSourceType.screenshot);
        for (let i = 0; i < maximumProviders; i++) {
            if (_.isNil(providersScore[i])) {
                listProvidersScore.push(new ExternalResult(ScoreSourceType.emptySource, []));
            } else {
                listProvidersScore.push(providersScore[i]);
            }
        }

        return listProvidersScore;
    }

    private outSidesScore(externalResults: ExternalResult[]) {
        return _.take(_.filter(externalResults, (item: ExternalResult) => item.sourceId >= ScoreSourceType.screenshot), 4);
    }

    public getTraderScores(resultDetails: ResultDetail[]) {
        const outsideScores: ExternalResultDetail[] = [];
        const mapsChecked = resultDetails.filter((map) => map.checked);
        _.forEach(mapsChecked, (map) => {
            const traderScore = map.externalScores.find((source) => source.sourceId === ScoreSourceType.trader);
            outsideScores.push(traderScore);
        });
        return outsideScores;
    }

    public getChangedTraderScores(resultDetails: ResultDetail[], originalResultDetails: ResultDetail[]) {
        let outsideScores: ExternalResultDetail[] = [];
        const mapsChecked = resultDetails.filter((map) => map.checked);
        _.forEach(mapsChecked, (map) => {
            const currentSources = map.externalScores.filter((source) => source.sourceId === ScoreSourceType.trader);
            const originalMap = originalResultDetails.find((item) => _.isEqual(item.resourceId, map.resourceId));
            const originalSources = originalMap.externalScores.filter((source) => source.sourceId === ScoreSourceType.trader);
            const changedScores = _.differenceWith(currentSources, originalSources, _.isEqual);
            if (changedScores.length > 0) {
                outsideScores = outsideScores.concat(changedScores);
            }
        });

        return outsideScores;
    }

    public sumTotalResultWin(resultDetails: GeneralResultDetail[], firstResourceId: string, totalGames: GeneralResultDetail) {
        if (resultDetails.length > 0 && this.isScoreConsecutive(resultDetails, firstResourceId)) {
            totalGames.homeValue = (_.countBy(resultDetails, (map) => Number(map.homeValue) > Number(map.awayValue)).true ?? 0).toString();
            totalGames.awayValue = (_.countBy(resultDetails, (map) => Number(map.homeValue) < Number(map.awayValue)).true ?? 0).toString();
        } else {
            totalGames.homeValue = "";
            totalGames.awayValue = "";
        }
    }

    public sumTotalScores(resultDetails: GeneralResultDetail[], firstResourceId: string,
        totalPoints: GeneralResultDetail, checkConsecutive = true) {
        if (resultDetails.length > 0 &&
            ((checkConsecutive && this.isScoreConsecutive(resultDetails, firstResourceId)) || !checkConsecutive)) {
            totalPoints.homeValue = _.sumBy(resultDetails, (map) => Number(map.homeValue)).toString();
            totalPoints.awayValue = _.sumBy(resultDetails, (map) => Number(map.awayValue)).toString();
        } else {
            totalPoints.homeValue = "";
            totalPoints.awayValue = "";
        }
    }

    public isConsistentTraderAndProvider(originalResultDetails: ResultDetail[],externalResults: ExternalResultDetail[]){
        return originalResultDetails.some(trader => {
            const suitableProvider = externalResults?.find(x => x.resourceId === trader.resourceId);
            return suitableProvider && (!_.isEqual(trader.homeValue ?? "", suitableProvider.homeValue ?? "")
                || !_.isEqual(trader.awayValue ?? "", suitableProvider.awayValue ?? ""))
        })
    }
   
    public isConsistentScoreTraderConfirm(originalResultDetails: ResultDetail[], resultDetails: ResultDetail[]) {
        return resultDetails.some(result => {
            const originalResult = originalResultDetails?.find(x => x.resourceId === result.resourceId);
            return (!_.isEqual(result.homeValue, originalResult?.homeValue ?? "")
                || !_.isEqual(result.awayValue, originalResult?.awayValue ?? ""));
        })
    }

    public isConsistentScoreProvider(resultDetails: ResultDetail[], externalResults: ExternalResultDetail[]) {
        return resultDetails.some(result => {
            const providerResult = externalResults?.find(x => x.resourceId === result.resourceId);
            return (!_.isEqual(providerResult?.homeValue ?? "", result.homeValue) 
                || !_.isEqual(providerResult?.awayValue ?? "", result.awayValue));
        })
    }

    public isEmptyHomeOrAwayValue(item: GeneralResultDetail) {
        return item.homeValue === null || _.isEmpty(item.homeValue)
            || item.awayValue === null || _.isEmpty(item.awayValue);
    }

    public compareInputScoreWithProviderScores(resultDetails: ResultDetail[], externalResults: ExternalResultDetail[]) {
        _.forEach(resultDetails, result => {
            const providerResult = externalResults.find(x => x.resourceId === result.resourceId);

            result.isScoreMismatched = providerResult  && !this.isEmptyHomeOrAwayValue(result) 
                && (!_.isEqual(providerResult.homeValue, result.homeValue) || !_.isEqual(providerResult.awayValue, result.awayValue)) && !this.acceptCaseZero(providerResult,result);
        });
    }

    public compareInputScoreTraderScores(originalResultDetails: ResultDetail[], resultDetails: ResultDetail[]) {
        _.forEach(resultDetails, result => {
                const originalResult = originalResultDetails.find(x => x.resourceId === result.resourceId)
                result.isScoreMismatched = originalResult && !this.isEmptyHomeOrAwayValue(result) && (!_.isEqual(result.homeValue, originalResult.homeValue)
                    || !_.isEqual(result.awayValue, originalResult.awayValue)) 
                    && !this.acceptCaseZero(originalResult,result);
        })
    }

    public acceptCaseZero(orinalResult: GeneralResultDetail, result: ResultDetail) {
       return (result.awayValue === "0" && result.homeValue === "0" && _.isEmpty(orinalResult.homeValue) && _.isEmpty(orinalResult.awayValue));
    }


}
