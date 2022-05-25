import { Injectable } from "@angular/core";
import { ResultDetail } from "../../shared/models/sportsbook-sop";
import { TicketStatusText } from "../../shared/constants";
import * as _ from 'lodash';

@Injectable()
export class IntervalCalculationService {
    public readonly calculatedStatus = "Complete";
    public readonly refundedStatus = "Refund";
    public readonly maximumInterval = 5;

    public isMatchNotCheckedWhenChangingIntervals(resultDetails: ResultDetail[], fullTimeId: string, totalRoundId: string) {
        const matchResult = _.find(resultDetails, (item) => _.isEqual(item.resourceId, fullTimeId));
        const selectedIntervals = _.filter(resultDetails, (item) => item.checked
                                                                 && !_.isEqual(item.resourceId, fullTimeId)
                                                                 && !_.isEqual(item.resourceId, totalRoundId));
        const existIntervals = selectedIntervals.length > 0;
        const isMatchCalculated = _.includes(matchResult.resultStatus, this.calculatedStatus);
        const isMatchNotChecked = !matchResult.checked;
        const isIntervalsChanged = this.isIntervalChanged(selectedIntervals);

        return existIntervals && isMatchCalculated && isIntervalsChanged && isMatchNotChecked;
    }

    private isIntervalChanged(intervals: ResultDetail[]) {
        if (intervals.length > 0) {
            return _.some(intervals, (item) => !_.isEqual(item.homeValue, item.originalHomeValue)
                                            || !_.isEqual(item.awayValue, item.originalAwayValue));
        }

        return false;
    }

    public isIntervalNotCheckedWhenCalculateMatch(resultDetails: ResultDetail[],
        isScoreDirect: boolean, fullTimeId: string, totalRoundId: string) {
        const matchResult = _.find(resultDetails, (item) => _.isEqual(item.resourceId, fullTimeId));
        if (matchResult.checked && !isScoreDirect) {
            const sumMatchScore = Number(matchResult.homeValue) + Number(matchResult.awayValue);
            const intervals = _.filter(resultDetails, (item) => !_.isEqual(item.resourceId, fullTimeId)
                                                            && !_.isEqual(item.resourceId, totalRoundId));
            const intervalsSumToMatch = intervals.slice(0, sumMatchScore);
            return _.some(intervalsSumToMatch, (item) => !this.isIntervalCheckedOrCalculated(item));
        }

        return false;
    }

    private isIntervalCheckedOrCalculated(interval: ResultDetail) {
        return interval.checked || _.includes(interval.resultStatus, this.calculatedStatus);
    }

    public isNonCheckedIntervalsConsistent(resultDetails: ResultDetail[], isScoreDirect: boolean,
        fullTimeId: string, totalRoundId: string) {
        const matchResult = _.find(resultDetails, (item) => _.isEqual(item.resourceId, fullTimeId));
        if (matchResult.checked && !isScoreDirect) {
            const sumMatchScore = Number(matchResult.homeValue) + Number(matchResult.awayValue);
            const intervals = _.filter(resultDetails, (item) => !_.isEqual(item.resourceId, fullTimeId)
                                                            && !_.isEqual(item.resourceId, totalRoundId));
            const otherIntervals = intervals.slice(sumMatchScore, this.maximumInterval);
            return otherIntervals.length > 0 && _.some(otherIntervals, (item) => this.isOtherIntervalNotConsistent(item));
        }

        return false;
    }

    private isOtherIntervalNotConsistent(interval: ResultDetail) {
        const isIntervalCalculated = _.includes(interval.resultStatus, this.calculatedStatus);
        const intervalHasTickets = !_.isEqual(interval.ticketStatus, TicketStatusText.noTicket);
        const isIntervalNotRefunded = !_.includes(interval.resultStatus, this.refundedStatus);
        return isIntervalCalculated || intervalHasTickets && isIntervalNotRefunded;
    }
}