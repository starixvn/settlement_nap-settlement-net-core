import { Injectable } from "@angular/core";
import { BetType, EventCounter, FastMarketResult } from "../models";
import * as _ from 'lodash';
import { TimeMachineAction, FastMarketBetType, ResultStatus } from "../constants";

@Injectable()
export class TimeMachineService {
    private readonly halfTimeMinute = 45;

    public getFirstCheckedPosition(timeMachineBetType: BetType) {
        const checkedIntervals = this.getCheckedIntervals(timeMachineBetType);
        return _.minBy(checkedIntervals, (interval) => interval.position).position;
    }

    public validateBeforeCalculation(betTypes: BetType[], action: number) {
        const timeMachineOU = this.getTimeMachineOUBetType(betTypes);
        const timeMachineHDP = this.getTimeMachineHDPBetType(betTypes);
        return this.isTimeMachineFailOnCalculation(timeMachineOU, action)
            || this.isTimeMachineFailOnCalculation(timeMachineHDP, action);
    }

    public isTimeMachineFailOnCalculation(timeMachineBetType: BetType, action: number) {
        const checkedIntervals = this.getCheckedIntervals(timeMachineBetType);
        if (checkedIntervals?.length > 0) {
            if (action === TimeMachineAction.verifyPreviousInterval) {
                const maxPosition = _.maxBy(checkedIntervals, (interval) => interval.position).position;
                return !_.isNil(_.find(timeMachineBetType.fastMarketResults, (result) =>
                    result.position < maxPosition && (!result.checked || !result.isShow)
                && result.resultStatus !== ResultStatus.completedAuto && result.resultStatus !== ResultStatus.completedManual));
            } else if (action === TimeMachineAction.verifyCheckedInterval) {
                const minPosition = _.minBy(checkedIntervals, (interval) => interval.position).position;
                const maxPosition = _.maxBy(checkedIntervals, (interval) => interval.position).position;
                return !_.isNil(_.find(timeMachineBetType.fastMarketResults, (result) =>
                    result.position < maxPosition && result.position > minPosition && !result.checked));
            }

            return false;
        }

        return false;
    }

    public validateBeforeRefund(betTypes: BetType[], action: number, isRefundSDT = false) {
        if (action === TimeMachineAction.verifyOverUnder) {
            return this.isTimeMachineOUFailOnRefund(betTypes, action);
        }

        if (action === TimeMachineAction.verifyFollowingInterval && isRefundSDT) {
            return this.isTimeMachineOUFailOnRefund(betTypes, action) || this.isTimeMachineHDPFailOnRefund(betTypes, action);
        }

        return this.isTimeMachineHDPFailOnRefund(betTypes, action);
    }

    public isTimeMachineOUFailOnRefund(betTypes:  BetType[], action: number) {
        const timeMachineBetType = this.getTimeMachineOUBetType(betTypes);
        const checkedIntervals = this.getCheckedIntervals(timeMachineBetType);
        if (checkedIntervals?.length > 0) {
            if (action === TimeMachineAction.verifyOverUnder) {
                return _.some(timeMachineBetType.fastMarketResults, (interval) => !interval.checked);
            }

            const minPosition = _.minBy(checkedIntervals, (interval) => interval.position).position;
            return !_.isNil(_.find(timeMachineBetType.fastMarketResults, (result) =>
                    (result.position > minPosition && !result.checked)
                    || (result.position < minPosition && (result.resultStatus === ResultStatus.refund
                        || result.resultStatus === ResultStatus.refundWithDetermined))));
        }

        return false;
    }

    public isTimeMachineHDPFailOnRefund(betTypes: BetType[], action: number) {
        const timeMachineBetType = this.getTimeMachineHDPBetType(betTypes);
        const checkedIntervals = this.getCheckedIntervals(timeMachineBetType);
        if (checkedIntervals?.length > 0) {
            if (action === TimeMachineAction.verifyPreviousInterval) {
                const minPosition = _.minBy(checkedIntervals, (interval) => interval.position).position;
                return !_.isNil(_.find(timeMachineBetType.fastMarketResults, (result) => result.position < minPosition
                    && !this.isIntervalSettled(result)));
            } else if (action === TimeMachineAction.verifyCheckedInterval) {
                return false;
            } else {
                const minPosition = _.minBy(checkedIntervals, (interval) => interval.position).position;
                return !_.isNil(_.find(timeMachineBetType.fastMarketResults, (result) =>
                    (result.position > minPosition && !result.checked)
                    || (result.position < minPosition && (result.resultStatus === ResultStatus.refund))));
            }
        }

        return false;
    }

    public validateBeforeUncalculation(betTypes: BetType[], action: number) {
        return this.isTimeMachineOUFailOnUncalculation(betTypes, action)
            || this.isTimeMachineHDPFailOnUncalculation(betTypes, action);
    }

    public isTimeMachineOUFailOnUncalculation(betTypes: BetType[], action: number) {
        const timeMachineBetType = this.getTimeMachineOUBetType(betTypes);
        const checkedIntervals = this.getCheckedIntervals(timeMachineBetType);
        if (checkedIntervals?.length > 0) {
            if (action === TimeMachineAction.verifyPreviousInterval) {
                const minPosition = _.minBy(checkedIntervals, (interval) => interval.position).position;
                return !_.isNil(_.find(timeMachineBetType.fastMarketResults, (result) => result.position < minPosition
                    && (result.resultStatus === ResultStatus.refund || result.resultStatus === ResultStatus.refundWithDetermined)));
            } else {
                const minPosition = _.minBy(checkedIntervals, (interval) => interval.position).position;
                return !_.isNil(_.find(timeMachineBetType.fastMarketResults, (result) =>
                    result.position > minPosition && !result.checked
                    && this.isIntervalSettled(result)));
            }
        }

        return false;
    }

    public isTimeMachineHDPFailOnUncalculation(betTypes: BetType[], action: number) {
        const timeMachineBetType = this.getTimeMachineHDPBetType(betTypes);
        const checkedIntervals = this.getCheckedIntervals(timeMachineBetType);
        if (checkedIntervals?.length > 0) {
            if (action === TimeMachineAction.verifyPreviousInterval) {
                const minPosition = _.minBy(checkedIntervals, (interval) => interval.position).position;
                return !_.isNil(_.find(timeMachineBetType.fastMarketResults, (result) => result.position < minPosition
                    && (result.resultStatus === ResultStatus.refund)));
            } else {
                const minPosition = _.minBy(checkedIntervals, (interval) => interval.position).position;
                return !_.isNil(_.find(timeMachineBetType.fastMarketResults, (result) =>
                    result.position > minPosition && !result.checked
                    && this.isIntervalSettled(result)));
            }
        }

        return false;
    }

    private getCheckedIntervals(timeMachineBetType: BetType) {
        return timeMachineBetType?.fastMarketResults?.filter((result) => result.checked && result.isShow);
    }

    public getTimeMachineOUBetType(betTypes: BetType[]) {
        return betTypes.find((betType) => betType.betTypeId === FastMarketBetType.timeMachineOverUnder);
    }

    public getTimeMachineHDPBetType(betTypes: BetType[]) {
        return betTypes.find((betType) => betType.betTypeId === FastMarketBetType.timeMachineHDP);
    }

    public getAllTimeMachine(betTypes: BetType[]) {
        return betTypes.filter((betType) => betType.betTypeId === FastMarketBetType.timeMachineOverUnder
                                       || betType.betTypeId === FastMarketBetType.timeMachineHDP);
    }

    public isIntervalSettled(interval: FastMarketResult) {
        return interval.resultStatus === ResultStatus.completedAuto || interval.resultStatus === ResultStatus.completedManual
            || interval.resultStatus === ResultStatus.refund || interval.resultStatus === ResultStatus.refundWithDetermined;
    }

    public getCorrespondingInterval(intervals: FastMarketResult[], event: EventCounter) {
        if (event.position < this.halfTimeMinute) {
            return intervals.find((result) => result.position === event.position);
        } else {
            return intervals.find((result) => result.position === event.position + 1);
        }
    }

    public getCorrespondingEventCounter(eventCounters: EventCounter[], interval: FastMarketResult) {
        if (interval.position < this.halfTimeMinute) {
            return eventCounters.find((event) => event.position === interval.position);
        }

        if (interval.position > this.halfTimeMinute) {
            return eventCounters.find((event) => event.position === interval.position - 1);
        }

        return null;
    }
}