import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { GeneralResultDetail, ModalDialogMessage } from '../../shared/models';
import { Language } from '../../shared/language';
import { MessageBoxService } from '../../shared/services';
import { ResultStatusId, ScoreSourceType, SettlementStatusId } from '../../shared/constants';
import { ResourcesIds, BetTypes } from '../constants';
import { ExternalResultDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';


@Injectable()
export class VerificationService extends VerificationBaseService {

    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();

    constructor(
        private readonly messageBoxService: MessageBoxService,
        protected resultByTeamNamePipe: ResultByTeamNamePipe) {
        super(resultByTeamNamePipe);
        this.confirmationDialogMessage.title = Language.confirmationBox;
    }

    public isInputScoreInvalid(resultDetails: ResultDetail[], isScoreDirect: boolean) {
        const findMap = _.find(resultDetails, (map: ResultDetail) => this.isScoreEmpty(map));

        const fullTime = _.find(resultDetails, (map: ResultDetail) =>
            map.resourceId === ResourcesIds.finalScore
            && Number(map.homeValue) === 0
            && Number(map.awayValue) === 0);


        return !_.isNil(findMap) || (!_.isNil(fullTime) && !isScoreDirect);
    }

    private isScoreEmpty(quarter: ResultDetail) {
        const isOverTime = _.isEqual(quarter.resourceId, ResourcesIds.ot);
        const isHomeEmpty = _.isEmpty(quarter.homeValue);
        const isAwayEmpty = _.isEmpty(quarter.awayValue);
        const isOtScoreEmpty = isOverTime && isHomeEmpty !== isAwayEmpty;
        const isNonOtScoreEmpty = !isOverTime && (isHomeEmpty || isAwayEmpty);
        return isOtScoreEmpty || isNonOtScoreEmpty;
    }

    public isScoreConsecutive(resultDetails: GeneralResultDetail[]) {
        if (resultDetails.length === 1) {
            return false;
        }

        return _.every(resultDetails, (item) =>
            _.find(resultDetails, (resultDetail) => this.getQuarterPosition(resultDetail) === this.getQuarterPosition(item) - 1)
            || this.getQuarterPosition(item) === 1);
    }

    private getQuarterPosition(resultDetail: GeneralResultDetail) {
        return _.isEqual(resultDetail.resourceId, ResourcesIds.ot) ? 5 : Number(resultDetail.resourceId[1]);
    }

    public verifyIntervalsCalculated(sumScore: ResultDetail, quarters: ResultDetail[], isScoreDirect: boolean) {
        const isExistQuarterNotChecked = quarters.filter((quarter) => !quarter.checked).length > 0;
        return !isScoreDirect && sumScore.checked && isExistQuarterNotChecked
            && !this.areCalculated(quarters);
    }

    private areCalculated(quarter: ResultDetail[]) {
        const notCalculated = _.find(quarter, item => item.settlementStatusId !== SettlementStatusId.Calculated && !item.checked);
        return _.isNil(notCalculated);
    }

    public verifyScore(quarter: ResultDetail, isHalfTime: boolean,
        isScoreDirect: boolean, resultDetail: ResultDetail[]) {
        const oldScore = `${quarter.homeValue}-${quarter.awayValue}`;
        const quarterList = _.filter(resultDetail, item => item.resourceId !== ResourcesIds.finalScore
            && item.resourceId !== ResourcesIds.htScore);
        let newScore = '';
        let typeOfScore = '';
        let newHomeScore = '';
        let newAwayScore = '';
        if (_.isEmpty(quarter.homeValue) && _.isEmpty(quarter.awayValue) || !this.isSetsHaveScore(quarterList, isHalfTime)) {
            return;
        }
        if (isHalfTime) {
            newHomeScore = (Number(quarterList[0].homeValue) + Number(quarterList[1].homeValue)).toString();
            newAwayScore = (Number(quarterList[0].awayValue) + Number(quarterList[1].awayValue)).toString();
            newScore = `${newHomeScore}-${newAwayScore}`;
            typeOfScore = 'First Half';
        } else {
            newHomeScore = _.sumBy(quarterList, (game) => Number(game.homeValue)).toString();
            newAwayScore = _.sumBy(quarterList, (game) => Number(game.awayValue)).toString();
            typeOfScore = 'Full Time';
            newScore = `${newHomeScore}-${newAwayScore}`;
        }
        if (oldScore !== newScore && !isScoreDirect) {
            this.confirmationDialogMessage.message = this.getConfirmMessage(typeOfScore, oldScore, newScore);
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                quarter.homeValue = newHomeScore.toString();
                quarter.awayValue = newAwayScore.toString();
                quarter.isScoreMismatched = this.isMismatchedWarning(quarter);
            });
        }
    }

    private getConfirmMessage(typeOfScore: string, oldScore: string, newScore: string) {
        return Language.TotalScoreNotMatchConfirmation
            .replace(/TOTAL_SCORE/g, typeOfScore)
            .replace(/OLD_SCORE/g, oldScore)
            .replace(/NEW_SCORE/g, newScore);
    }

    private isSetsHaveScore(quarterList: ResultDetail[], isHalfTime: boolean) {
        if (isHalfTime) {
            return _.filter([quarterList[0], quarterList[1]], item => item.homeValue || item.awayValue).length > 0;
        } else {
            return _.filter(quarterList, item => item.homeValue || item.awayValue).length > 0;
        }
    }

    public isFtScoreLowerThanHtScore(resultDetailList: ResultDetail[]) {
        const fullTime = _.find(resultDetailList, set => _.isEqual(set.resourceId, ResourcesIds.finalScore) &&
            this.isExistedHomeAwayScore(set.homeValue, set.awayValue));
        const halfTime = _.find(resultDetailList, set => _.isEqual(set.resourceId, ResourcesIds.htScore) &&
            this.isExistedHomeAwayScore(set.homeValue, set.awayValue));

        return fullTime && halfTime && (Number(halfTime.homeValue) > Number(fullTime.homeValue)
            || Number(halfTime.awayValue) > Number(fullTime.awayValue));
    }

    public isTicketOnQuarter(resultDetails: ResultDetail[], matchResultDetails: ResultDetail[]) {
        const haveTicket = this.isTicketOnGame(resultDetails, ResourcesIds.htScore, ResourcesIds.finalScore);
        const checkBetType = _.filter(matchResultDetails, item => _.includes(BetTypes.directly, item.resourceId)).length > 0;
        return haveTicket || checkBetType;
    }

    private isExistOverTimeScoreSources(map: ResultDetail) {
        if (_.isEqual(map.resourceId, ResourcesIds.ot)) {
            const providerScore = this.findExistedProvider(map);
            const outsideScore = this.findExistedOutside(map);
            return _.isNil(providerScore) === _.isNil(outsideScore);
        }

        return false;
    }

    private findExistedProvider(map: ResultDetail) {
        return _.find(map.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot
            && this.isExistedHomeAwayScore(source.homeValue, source.awayValue));
    }

    private findExistedOutside(map: ResultDetail) {
        return _.find(map.externalScores, (source) => source.sourceId >= ScoreSourceType.screenshot
            && this.isExistedHomeAwayScore(source.homeValue, source.awayValue));
    }

    public allMapHaveScoreSources(resultDetails: ResultDetail[]) {
        const findMap = resultDetails.filter((map: ResultDetail) => map.checked);
        let result = true;
        _.forEach(findMap, (map) => {
            if (!this.isExistScoreSources(map) && !this.isExistOverTimeScoreSources(map)) {
                result = false;
            }
        });

        return result;
    }

    public isExistedHomeAwayScore(homeValue: string, awayValue: string) {
        return !_.isEmpty(homeValue) && !_.isEmpty(awayValue);
    }

    public isHalfTimeMismatched(resultDetails: ResultDetail[], firstHalfResults: ResultDetail[], isScoreDirect: boolean) {
        const firstHalf = resultDetails.find((map) => _.isEqual(map.resourceId, ResourcesIds.htScore)
            && map.homeValue && map.awayValue);
        const maps = firstHalfResults.filter((map) => this.isExistedHomeAwayScore(map.homeValue, map.awayValue));

        if (this.isSumByMaps(firstHalf, maps, isScoreDirect)) {
            const totalHome = _.sumBy(maps, (map) => Number(map.homeValue)).toString();
            const totalAway = _.sumBy(maps, (map) => Number(map.awayValue)).toString();
            return !_.isEqual(firstHalf.homeValue, totalHome.toString()) || !_.isEqual(firstHalf.awayValue, totalAway.toString());
        }

        return false;
    }

    private isSumByMaps(fullTime: ResultDetail, maps: ResultDetail[], isScoreDirect: boolean) {
        return fullTime && maps.length > 0 && !isScoreDirect;
    }

    public isExistInHouseResult(result: ResultDetail) {
        const inHouseResult = _.filter(result.externalScores, (source) =>
            source.sourceId < ScoreSourceType.screenshot && !_.isEmpty(source.homeValue));
        if (_.isEmpty(inHouseResult)) {
            return false;
        } else {
            return this.verifyInHouseResult(result, inHouseResult);
        }
    }

    private verifyInHouseResult(result: ResultDetail, externalResult: ExternalResultDetail[]) {
        const excludeResultStatusId = [ResultStatusId.RunningThree, ResultStatusId.AutoCompleted, ResultStatusId.ManualCompleted];
        if (externalResult.length === 1 && externalResult[0].sourceId === ScoreSourceType.trader
            && externalResult[0].fromResultDetail && !_.includes(excludeResultStatusId, result.resultStatusId)) {
            return false;
        }
        return true;
    }

    public sumScoreHalfTime(firstHalfResults: GeneralResultDetail[], firstHalf: GeneralResultDetail) {
        const firstHalfHasValue = firstHalfResults.filter((item) =>
            this.isExistedHomeAwayScore(item.homeValue, item.awayValue));
        if (firstHalfHasValue.length > 1 && this.isScoreConsecutive(firstHalfHasValue)) {
            firstHalf.homeValue = _.sumBy(firstHalfResults, (map) => Number(map.homeValue)).toString();
            firstHalf.awayValue = _.sumBy(firstHalfResults, (map) => Number(map.awayValue)).toString();
        } else {
            firstHalf.homeValue = "";
            firstHalf.awayValue = "";
        }
    }

    public sumScoreFullTime(quarterResults: GeneralResultDetail[], fullTime: GeneralResultDetail) {
        const minimumQuarters = 4;
        const maps = quarterResults.filter((item) =>
            this.isExistedHomeAwayScore(item.homeValue, item.awayValue));
        if (maps.length >= minimumQuarters && this.isScoreConsecutive(maps)) {
            fullTime.homeValue = _.sumBy(maps, (map) => Number(map.homeValue)).toString();
            fullTime.awayValue = _.sumBy(maps, (map) => Number(map.awayValue)).toString();
        } else {
            fullTime.homeValue = "";
            fullTime.awayValue = "";
        }
    }

    public isPinGoalMatch(leagueGroupId: number) {
        const pinGoalLeague = 122;
        return leagueGroupId === pinGoalLeague;
    }
}
