import { BetTypes } from '../../../constants';
import { Injectable } from '@angular/core';
import { ResultDetail } from '../../../models';
import * as _ from 'lodash';
import { SettlementStatusId } from '../../../../shared/constants';
@Injectable()
export class VerifyService {
    private readonly roundPenaltyShootout = 5;
    private readonly endFullMinute = 90;
    private readonly endHalfMinute = 45;
    private readonly endSecond = 59;

    public isOverTime(list: ResultDetail[]): boolean {
        let flag = false;
        const result = _.filter(list, (item: ResultDetail) => _.isEqual(item.betType, BetTypes.TimeOfFirstCorner)
            || _.isEqual(item.betType, BetTypes.TimeOfSecondCorner));

        result.forEach((item: ResultDetail) => {
            const home = Number(item.homeValue);
            const away = Number(item.awayValue);
            if (_.isEqual(item.betType, BetTypes.TimeOfFirstCorner)) {
                item.isAwayValueWarning = home === this.endFullMinute && away > 0;
            } else if (_.isEqual(item.betType, BetTypes.TimeOfSecondCorner)) {
                item.isAwayValueWarning = (home === this.endHalfMinute && away < 1)
                    || (home === this.endFullMinute && away > 0);
            }

            if (!flag) {
                flag = item.isAwayValueWarning;
            }
        });

        return flag;
    }

    public isInvalidSecondTime(list: ResultDetail[]) {
        const result = _.find(list, (item: ResultDetail) => _.isEqual(item.betType, BetTypes.TimeOfFirstCorner)
            || _.isEqual(item.betType, BetTypes.TimeOfSecondCorner));
        if (_.isNil(result)) {
            return false;
        } else {
            result.isAwayValueWarning = Number(result.awayValue) > this.endSecond;
            return result.isAwayValueWarning;
        }
    }

    public isInvalidMinuteTimeOf2HFirstCorner(list: ResultDetail[]): boolean {
        const result = _.find(list, (item: ResultDetail) => _.isEqual(item.betType, BetTypes.TimeOfSecondCorner));
        if (_.isNil(result)) {
            return false;
        } else {
            result.isHomeValueWarning = (Number(result.homeValue) > this.endFullMinute
                || (Number(result.homeValue) !== 0 && Number(result.homeValue) < this.endHalfMinute));
            return result.isHomeValueWarning;
        }
    }

    public isInvalidMinuteTimeOfFirstCorner(list: ResultDetail[]) {
        const result = _.find(list, (item: ResultDetail) => _.isEqual(item.betType, BetTypes.TimeOfFirstCorner));
        if (_.isNil(result)) {
            return false;
        } else {
            result.isHomeValueWarning = Number(result.homeValue) > this.endFullMinute;
            return result.isHomeValueWarning;
        }
    }

    public isValidOnRound(resultDetails: ResultDetail[]) {
        let flag = false;
        const group = _.uniqBy(resultDetails, (item) => item.map);
        _.forEach(group, (g) => {
            const listResultDetailOnRound = this.resultDetailOnRound(resultDetails, g.map);
            const listRelatedMainBetType = this.groupRelatedOnRound(listResultDetailOnRound);
            if (listRelatedMainBetType.length > 0) {
                const listRunningAndNotSelected = this.homeAwayBetTypeNotSelected(listResultDetailOnRound);
                flag = this.isFailOnSelectedProceed(listRunningAndNotSelected, flag);
            }
        });

        return flag;
    }

    private isFailOnSelectedProceed(resultDetails: ResultDetail[], currentFlag: boolean) {
        let flag = false;
        _.forEach(resultDetails, (x) => {
            x.isInvalidSelectedProceed = true;
            flag = true;
        });

        return flag || currentFlag;
    }

    public isValidOnFirstTen(resultDetails: ResultDetail[]) {
        return this.isValidHomeAwayBetTypesOnFirstTen(resultDetails)
            || this.isValidHomeOrAwayBetTypesOnFirstTen(resultDetails);
    }

    private isValidHomeAwayBetTypesOnFirstTen(resultDetails: ResultDetail[]) {
        let flag = false;
        const homeAwayFirstTen = this.homeAwayFirstTenBetType(resultDetails);
        if (homeAwayFirstTen.length > 0) {
            const group = _.uniqBy(resultDetails, (item) => item.map);
            _.forEach(group, (g) => {
                const homeAwayBetTypeNotSelected = this.homeAwayBetTypeNotSelected(resultDetails);
                flag = this.isFailOnSelectedProceed(homeAwayBetTypeNotSelected, flag);
            });
        }

        return flag;
    }

    private isValidHomeOrAwayBetTypesOnFirstTen(resultDetails: ResultDetail[]) {
        let flag = false;
        const homeFirstTen = this.homeFirstTenBetType(resultDetails);
        const awayFirstTen = this.awayFirstTenBetType(resultDetails);

        if (homeFirstTen.length > 0 || awayFirstTen.length > 0) {
            const group = _.uniqBy(resultDetails, (item) => item.map);
            _.forEach(group, (g) => {
                if (homeFirstTen.length > 0) {
                    const homeBetTypeNotSelected = this.homeBetTypeNotSelected(resultDetails, g.map);
                    flag = this.isFailOnSelectedProceed(homeBetTypeNotSelected, flag);
                }

                if (awayFirstTen.length > 0) {
                    const awayBetTypeNotSelected = this.awayBetTypeNotSelected(resultDetails, g.map);
                    flag = this.isFailOnSelectedProceed(awayBetTypeNotSelected, flag);
                }
            });
        }

        return flag;
    }

    private resultDetailOnRound(resultDetails: ResultDetail[], groupId: number) {
        return _.filter(resultDetails, (item) => item.map === groupId && item.map > 0
            && item.map <= this.roundPenaltyShootout);
    }

    private groupRelatedOnRound(resultDetails: ResultDetail[]) {
        const betTypes = [BetTypes.PenaltyShootout1X2, BetTypes.PenaltyShootoutBothOneNeither
            , BetTypes.PenaltyWoodwork];
        return _.filter(resultDetails, (item) => item.checked && _.includes(betTypes, item.betType));
    }

    private homeFirstTenBetType(resultDetails: ResultDetail[]) {
        return _.filter(resultDetails, (item) => item.checked
            && _.isEqual(BetTypes.PenaltyShootoutHomeScore, item.betType));
    }

    private awayFirstTenBetType(resultDetails: ResultDetail[]) {
        return _.filter(resultDetails, (item) => item.checked
            && _.isEqual(BetTypes.PenaltyShootoutAwayScore, item.betType));
    }

    private homeAwayFirstTenBetType(resultDetails: ResultDetail[]) {
        return _.filter(resultDetails, (item) => item.checked
            && _.includes([BetTypes.PenaltyShootoutExactTotalGoals,
                BetTypes.PenaltyShootoutOddEven, BetTypes.PenaltyShootoutCombo], item.betType));
    }

    private homeBetTypeNotSelected(resultDetails: ResultDetail[], groupId: number) {
        return _.filter(resultDetails, (item) => item.map === groupId && !item.checked
            && item.settlementStatusId === SettlementStatusId.Running
            && _.isEqual(BetTypes.HomePenaltyShootout, item.betType) && item.map <= this.roundPenaltyShootout);
    }

    private awayBetTypeNotSelected(resultDetails: ResultDetail[], groupId: number) {
        return _.filter(resultDetails, (item) => item.map === groupId && !item.checked
            && item.settlementStatusId === SettlementStatusId.Running
            && _.isEqual(BetTypes.AwayPenaltyShootout, item.betType) && item.map <= this.roundPenaltyShootout);
    }

    private homeAwayBetTypeNotSelected(resultDetails: ResultDetail[]) {
        return _.filter(resultDetails, (item) => item.settlementStatusId === SettlementStatusId.Running && !item.checked
            && _.includes([BetTypes.HomePenaltyShootout, BetTypes.AwayPenaltyShootout], item.betType)
            && item.map <= this.roundPenaltyShootout);
    }
}