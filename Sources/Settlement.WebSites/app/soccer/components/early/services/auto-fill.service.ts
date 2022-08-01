import { BetTypes, ResultValue } from '../../../constants';
import { Injectable } from '@angular/core';
import { ResultDetail, Score } from '../../../models';
import * as _ from 'lodash';
import { PenaltyShootout1x2Service } from './penalty-shootout1x2.service';
import { PenaltyShootoutService } from './penalty-shootout.service';
import { PenaltyWoodWorkService } from './penalty-wood-work.service';
import { PenaltyShootoutBothOneNeitherService } from './penalty-shootout-both-one-neither.service';
import { SettlementStatusId } from '../../../../shared/constants';

@Injectable()
export class AutoFillService {
    constructor(
        public penaltyService: PenaltyShootoutService,
        public penaltyWoodWorkService: PenaltyWoodWorkService,
        public penalty1x2Service: PenaltyShootout1x2Service,
        public penaltyBothOneNeitherService: PenaltyShootoutBothOneNeitherService) {
    }

    public autoFillResult(resultDetails: ResultDetail[], selectedItem: ResultDetail) {
        const listPenaltyShootoutRound = this.penaltyService.listPenaltyShootoutRound(resultDetails);
        const homeScoreFirstTen = this.penaltyService.countHomePenaltyShooutoutByScore(listPenaltyShootoutRound);
        const awayScoreFirstTen = this.penaltyService.countAwayPenaltyShooutoutByScore(listPenaltyShootoutRound);
        const homeCombo = this.penaltyService.getHomePenaltyShootoutCombo(listPenaltyShootoutRound);
        const awayCombo = this.penaltyService.getAwayPenaltyShootoutCombo(listPenaltyShootoutRound);
        const selectedScoreByRound = listPenaltyShootoutRound[selectedItem.map - 1];
        if (_.isEqual(selectedItem.betType, BetTypes.HomePenaltyShootout)
            || _.isEqual(selectedItem.betType, BetTypes.AwayPenaltyShootout)) {
            _.forEach(resultDetails, (result) => {
                if (result.map === selectedItem.map) {
                    this.resetValueOnRound(result, selectedScoreByRound, selectedItem.betType);
                } else {
                    this.resetValueOnFirstTen(result, homeScoreFirstTen, awayScoreFirstTen, homeCombo, awayCombo);
                }
            });
        } else {
            selectedItem.isInvalidValue = this.checkConsistentOnBetTypes(selectedItem, selectedScoreByRound);
            const isNotTaken = this.penaltyService.isSelectedNotTaken(selectedItem.homeValue);
            selectedItem.isNotTaken = isNotTaken;
            selectedItem.isSettleDetermined = isNotTaken && !selectedItem.isInvalidValue;
        }
    }

    public changeValueOnPenaltyFirstTen(resultDetails: ResultDetail[], selectedItem: ResultDetail) {
        const listPenaltyShootoutRound = this.penaltyService.listPenaltyShootoutRound(resultDetails);
        const home = this.penaltyService.countHomePenaltyShooutoutByScore(listPenaltyShootoutRound);
        const away = this.penaltyService.countAwayPenaltyShooutoutByScore(listPenaltyShootoutRound);
        const homeCombo = this.penaltyService.getHomePenaltyShootoutCombo(listPenaltyShootoutRound);
        const awayCombo = this.penaltyService.getAwayPenaltyShootoutCombo(listPenaltyShootoutRound);
        const countScore = new Score(home, away);
        const comboScore = new Score(homeCombo, awayCombo);

        if (_.isEqual(selectedItem.betType, BetTypes.PenaltyShootoutHomeScore)
            || _.isEqual(selectedItem.betType, BetTypes.PenaltyShootoutAwayScore)) {
            this.changeValueOnHomeOrAwayFirstTen(selectedItem, countScore);
        } else if (_.isEqual(selectedItem.betType, BetTypes.PenaltyShootoutCombo)) {
            this.changeValueOnHomeAndAwayFirstTen(selectedItem, comboScore);
        } else {
            this.changeValueOnHomeAndAwayFirstTen(selectedItem, countScore);
        }
    }

    private changeValueOnHomeOrAwayFirstTen(selectedItem: ResultDetail, countScore: Score) {
        const statusId = selectedItem.settlementStatusId;
        if (_.isEqual(selectedItem.betType, BetTypes.PenaltyShootoutHomeScore)) {
            selectedItem.isInvalidValue = !this.penaltyService.isMatched(statusId,
                countScore.homeValue, selectedItem.homeValue);
        } else if (_.isEqual(selectedItem.betType, BetTypes.PenaltyShootoutAwayScore)) {
            selectedItem.isInvalidValue = !this.penaltyService.isMatched(statusId,
                countScore.awayValue, selectedItem.homeValue);
        }
    }

    private changeValueOnHomeAndAwayFirstTen(selectedItem: ResultDetail, score: Score) {
        const betTypesFirstTenGroup = [BetTypes.PenaltyShootoutExactTotalGoals, BetTypes.PenaltyShootoutOddEven
            , BetTypes.PenaltyShootoutCombo];
        if (_.includes(betTypesFirstTenGroup, selectedItem.betType)) {
            selectedItem.isInvalidValue = !this.penaltyService.isMatchedHomeAwayOnPenaltyFirstTen(score.homeValue,
                score.awayValue, selectedItem);
        }
    }

    public checkConsistentOnBetTypes(selectedItem: ResultDetail, score: Score) {
        let homeValue = selectedItem.homeValue;
        if (_.isEqual(selectedItem.betType, BetTypes.PenaltyWoodwork)) {
            return this.penaltyWoodWorkService.isInvalidHomeOrAwayResult(selectedItem, score);
        } else if (selectedItem.settlementStatusId === SettlementStatusId.Running
            && (_.isNil(homeValue) || _.isEmpty(homeValue))) {
            return false;
        } else {
            if (_.isEqual(selectedItem.betType, BetTypes.PenaltyShootout1X2)) {
                homeValue = this.penalty1x2Service.resetValuePenaltyShootout1X2(score);
            } else if (_.isEqual(selectedItem.betType, BetTypes.PenaltyShootoutBothOneNeither)) {
                homeValue = this.penaltyBothOneNeitherService.resetValuePenalyShootoutBothOneNeither(score);
            }
            return !_.isEqual(selectedItem.homeValue, homeValue);
        }
    }

    private resetValueOnRound(result: ResultDetail, score: Score, selectedBetType: string) {
        const isEmptyValue = result.isNotExistedValue;
        let isBothNotTaken = false;
        if (_.isEqual(result.betType, BetTypes.PenaltyWoodwork)) {
            if (_.isEqual(selectedBetType, BetTypes.HomePenaltyShootout)) {
                const newValue = this.penaltyWoodWorkService.resetResultValue(result.homeValue, score.homeValue);
                result.homeValue = this.resetValueWithRunning(isEmptyValue, result.homeValue, newValue);
            }
            if (_.isEqual(selectedBetType, BetTypes.AwayPenaltyShootout)) {
                const newValue = this.penaltyWoodWorkService.resetResultValue(result.awayValue, score.awayValue);
                result.awayValue = this.resetValueWithRunning(isEmptyValue, result.awayValue, newValue);
            }
            isBothNotTaken = _.isEqual(result.homeValue, ResultValue.NotTaken)
                && _.isEqual(result.awayValue, ResultValue.NotTaken);

        } else if (_.isEqual(result.betType, BetTypes.PenaltyShootout1X2)) {
            const newValue = this.penalty1x2Service.resetValuePenaltyShootout1X2(score);
            result.homeValue = this.resetValueWithRunning(isEmptyValue, result.homeValue, newValue);
        } else if (_.isEqual(result.betType, BetTypes.PenaltyShootoutBothOneNeither)) {
            const newValue = this.penaltyBothOneNeitherService.resetValuePenalyShootoutBothOneNeither(score);
            result.homeValue = this.resetValueWithRunning(isEmptyValue, result.homeValue, newValue);
        }

        result.isResultWarning = false;
        result.isInvalidValue = this.checkConsistentOnBetTypes(result, score);

        const isNotTaken = this.isNotTaken(result, selectedBetType);

        result.isNotTaken = isNotTaken;
        result.isSettleDetermined = !result.isInvalidValue && isNotTaken && !isBothNotTaken;
    }
    private isNotTaken(result: ResultDetail, selectedBetType: string) {
        if (_.isEqual(result.betType, BetTypes.HomePenaltyShootout)) {
            return _.isEqual(selectedBetType, BetTypes.HomePenaltyShootout)
                ? this.penaltyService.isSelectedNotTaken(result.homeValue)
                : result.isNotTaken;

        } else if (_.isEqual(result.betType, BetTypes.AwayPenaltyShootout)) {
            return _.isEqual(selectedBetType, BetTypes.AwayPenaltyShootout)
                ? this.penaltyService.isSelectedNotTaken(result.homeValue)
                : result.isNotTaken;

        } else {
            return this.penaltyService.isSelectedNotTaken(result.homeValue)
                || this.penaltyService.isSelectedNotTaken(result.awayValue);
        }
    }

    private resetValueWithRunning(isEmptyValue: boolean, oldValue: string, newValue: string) {
        return isEmptyValue ? newValue : oldValue;
    }

    public resetValueOnFirstTen(
        result: ResultDetail, homeScoreFirstTen: string,
        awayScoreFirstTen: string, homeCombo: string, awayCombo: string) {
        const statusId = result.settlementStatusId;
        const isEmptyValue = result.isNotExistedValue;
        if (_.isEqual(result.betType, BetTypes.PenaltyShootoutHomeScore)) {
            result.homeValue = this.resetValueWithRunning(isEmptyValue, result.homeValue, homeScoreFirstTen);
            result.isInvalidValue = !this.penaltyService.isMatched(statusId, homeScoreFirstTen, result.homeValue);
        } else if (_.isEqual(result.betType, BetTypes.PenaltyShootoutAwayScore)) {
            result.homeValue = this.resetValueWithRunning(isEmptyValue, result.homeValue, awayScoreFirstTen);
            result.isInvalidValue = !this.penaltyService.isMatched(statusId, awayScoreFirstTen, result.homeValue);
        } else if (_.isEqual(result.betType, BetTypes.PenaltyShootoutOddEven)
            || _.isEqual(result.betType, BetTypes.PenaltyShootoutExactTotalGoals)) {

            if (this.isEmptyCurrentValue(result, homeScoreFirstTen, awayScoreFirstTen)) {
                result.homeValue = "";
                result.awayValue = "";
            } else {
                result.homeValue = this.resetValueWithRunning(isEmptyValue, result.homeValue, homeScoreFirstTen);
                result.awayValue = this.resetValueWithRunning(isEmptyValue, result.awayValue, awayScoreFirstTen);
            }
            result.isInvalidValue = !this.penaltyService.isMatchedHomeAwayOnPenaltyFirstTen(homeScoreFirstTen,
                awayScoreFirstTen, result);
        } else if (_.isEqual(result.betType, BetTypes.PenaltyShootoutCombo)) {
            result.homeValue = this.resetValueWithRunning(isEmptyValue, result.homeValue, homeCombo);
            result.awayValue = this.resetValueWithRunning(isEmptyValue, result.awayValue, awayCombo);
            result.isInvalidValue = !this.penaltyService.isMatchedHomeAwayOnPenaltyFirstTen(homeCombo, awayCombo, result);
        }

        result.isResultWarning = false;
    }

    private isEmptyCurrentValue(result: ResultDetail, homeScoreFirstTen: string, awayScoreFirstTen: string) {
        return this.penaltyService.isEmptyScore(homeScoreFirstTen, awayScoreFirstTen)
            && result.settlementStatusId === SettlementStatusId.Running
            && _.isEmpty(result.homeValue) && _.isEmpty(result.awayValue);
    }
}