import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Score, ResultDetail } from '../../../models';
import { ResultValue, BetTypes } from '../../../constants';
import { SettlementStatusId } from '../../../../shared/constants';
@Injectable()
export class PenaltyShootoutService {
    public isSelectedNotTaken(value: string) {
        return _.isEqual(value, ResultValue.NotTaken)
            || _.isEqual(value, ResultValue.HomeScoreAwayNotTaken)
            || _.isEqual(value, ResultValue.HomeMissAwayNotTaken)
            || _.isEqual(value, ResultValue.HomeNotTakenAwayScore)
            || _.isEqual(value, ResultValue.HomeNotTakenAwayMiss);
    }

    public isEmptyScore(home: string, away: string) {
        return _.isEmpty(home) || _.isEmpty(away);
    }

    public isEmptyHomeOrAwayValue(item: ResultDetail): boolean {
        if (_.includes([BetTypes.TimeOfFirstCorner, BetTypes.TimeOfSecondCorner,
        BetTypes.PenaltyShootoutOddEven, BetTypes.PenaltyShootoutExactTotalGoals,
        BetTypes.PenaltyWoodwork], item.betType)) {
            return item.homeValue === null || item.homeValue === '' || item.awayValue === null || item.awayValue === '';
        } else {
            return item.homeValue === null || item.homeValue === '';
        }
    }

    public getScoreValue(value: string) {
        return value === null ? "" : value;
    }

    public listPenaltyShootoutRound(resultDetails: ResultDetail[]) {
        const penaltyShootoutRound: Score[] = [];
        const homeAwayPenaltyShootout = resultDetails.filter((r) => _.isEqual(r.betType, BetTypes.HomePenaltyShootout)
            || _.isEqual(r.betType, BetTypes.AwayPenaltyShootout));
        for (let i = 1; i < 6; i++) {
            const homeValue = this.homeValueOfPenaltyShootoutByBettype(i, homeAwayPenaltyShootout);
            const awayValue = this.awayValueOfPenaltyShootoutByBettype(i, homeAwayPenaltyShootout);
            penaltyShootoutRound.push(new Score(homeValue, awayValue));
        }

        return penaltyShootoutRound;
    }

    public countHomePenaltyShooutoutByScore(scores: Score[]): string {
        const homeValueIsNotEmpty = _.every(scores, (s) => !_.isEmpty(s.homeValue));
        if (homeValueIsNotEmpty) {
            const homeScore = scores.filter((s) => _.isEqual(s.homeValue, ResultValue.Score)).length;
            return _.toString(homeScore);
        } else {
            return "";
        }
    }

    public countAwayPenaltyShooutoutByScore(scores: Score[]): string {
        const awayValueIsNotEmpty = _.every(scores, (s) => !_.isEmpty(s.awayValue));
        if (awayValueIsNotEmpty) {
            const awayScore = scores.filter((s) => _.isEqual(s.awayValue, ResultValue.Score)).length;
            return _.toString(awayScore);
        } else {
            return "";
        }
    }

    public getHomePenaltyShootoutCombo(scores: Score[]): string {
        const homeValueIsNotEmpty = _.every(scores, (s) => !_.isEmpty(s.homeValue));
        let homeCombo = '';
        if (homeValueIsNotEmpty) {
            scores.forEach((s) => {
                if (_.isEqual(s.homeValue, ResultValue.NotTaken)) {
                    homeCombo += 'N';
                } else {
                    homeCombo += s.homeValue;
                }
            });
            return homeCombo;
        } else {
            return '';
        }
    }

    public getAwayPenaltyShootoutCombo(scores: Score[]): string {
        const awayValueIsNotEmpty = _.every(scores, (s) => !_.isEmpty(s.awayValue));
        let awayCombo = '';
        if (awayValueIsNotEmpty) {
            scores.forEach((s) => {
                if (_.isEqual(s.awayValue, ResultValue.NotTaken)) {
                    awayCombo += 'N';
                } else {
                    awayCombo += s.awayValue;
                }
            });
            return awayCombo;
        } else {
            return '';
        }
    }

    public isMatchedHomeAwayOnPenaltyFirstTen(mainHome: string, mainAway: string, selectedItem: ResultDetail) {
        return (selectedItem.settlementStatusId === SettlementStatusId.Running
            && _.isEmpty(selectedItem.homeValue) && _.isEmpty(selectedItem.awayValue))
            || (_.isEqual(selectedItem.homeValue, mainHome) && _.isEqual(selectedItem.awayValue, mainAway));
    }

    public isMatched(settlementStatusId: number, mainValue: string, firstTenValue: string) {
        return (settlementStatusId === SettlementStatusId.Running && _.isEmpty(firstTenValue))
            || _.isEqual(mainValue, firstTenValue);
    }

    private homeValueOfPenaltyShootoutByBettype(map: number, resultDetails: ResultDetail[]): string {
        const item = _.find(resultDetails, (r: ResultDetail) => _.isEqual(r.betType, BetTypes.HomePenaltyShootout)
            && r.map === map);
        return _.isNil(item) ? "" : item.homeValue;
    }

    private awayValueOfPenaltyShootoutByBettype(map: number, resultDetails: ResultDetail[]): string {
        const item = _.find(resultDetails, (r: ResultDetail) => _.isEqual(r.betType, BetTypes.AwayPenaltyShootout)
            && r.map === map);
        return _.isNil(item) ? "" : item.homeValue;
    }
}