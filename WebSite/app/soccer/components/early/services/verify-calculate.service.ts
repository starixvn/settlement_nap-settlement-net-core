import { CheckedSettleDetermined, Resources } from '../../../constants';
import { Injectable } from '@angular/core';
import { ResultDetail } from '../../../models';
import { PenaltyShootoutService } from './penalty-shootout.service';
import { VerifyRefundService } from './verify-refund.service';
import { VerifyService } from './verify.service';
import * as _ from 'lodash';
import { Language } from '../../../../shared/language.native';
@Injectable()
export class VerifyCalculateService {
    constructor(
        private readonly verifyService: VerifyService,
        private readonly verifyRefundService: VerifyRefundService,
        private readonly penaltyService: PenaltyShootoutService) {
    }

    public verifyInputValue(selectedResultDetails: ResultDetail[]) {
        const isEmpty = this.isEmptyResultValue(selectedResultDetails);
        return isEmpty ? Language.NotSpecifyValidResults : "";
    }

    public verifyPenaltyBettypeBeforeCalculation(selectedResultDetails: ResultDetail[], resultDetails: ResultDetail[]) {
        const isNotTaken = this.isSelectedNotTaken(selectedResultDetails);
        if (isNotTaken) {
            return Resources.NotTaken;
        }

        const isNotSettledHomeAway = this.isNotSettledHomeAway(resultDetails);
        if (isNotSettledHomeAway) {
            return Resources.InvalidAssociatedHomeAway;
        }

        const isInconsistent = this.isInconsistentValue(selectedResultDetails);
        return isInconsistent ? Resources.InconsistentValue : "";
    }

    public verifyCornerBettypeBeforeCalculation(selectedResultDetails: ResultDetail[]) {
        const isInvalidMinute = this.verifyService.isInvalidMinuteTimeOfFirstCorner(selectedResultDetails);
        if (isInvalidMinute) {
            return Resources.InvalidMinuteTimeOfFirstCorner;
        }

        const isInvalidMinute2H = this.verifyService.isInvalidMinuteTimeOf2HFirstCorner(selectedResultDetails);
        if (isInvalidMinute2H) {
            return Resources.InvalidMinuteTimeOf2HFirstCorner;
        }

        const isInvalidSecondTime = this.verifyService.isInvalidSecondTime(selectedResultDetails);
        if (isInvalidSecondTime) {
            return Resources.InvalidSecondTime;
        }

        const isOverTime = this.verifyService.isOverTime(selectedResultDetails);
        return isOverTime ? Language.NotSpecifyValidResults : "";
    }

    public verifyPenaltyBettypeBeforeRefund(selectedResultDetails: ResultDetail[], resultDetails: ResultDetail[]) {
        const isEmpty = this.verifyRefundService.isEmptyResultValue(selectedResultDetails);
        if (isEmpty) {
            return Language.NotSpecifyValidResults;
        }

        const isNotExisted = this.verifyRefundService.isExistedNotTaken(selectedResultDetails);
        if (isNotExisted) {
            return Resources.NotTaken;
        }

        const isNotSettledHomeAway = this.isNotSettledHomeAway(resultDetails);
        if (isNotSettledHomeAway) {
            return Resources.InvalidAssociatedHomeAway;
        }

        const isInconsistent = this.verifyRefundService.isInconsistentValue(selectedResultDetails);
        return isInconsistent ? Resources.InconsistentValue : "";
    }

    private isSelectedNotTaken(list: ResultDetail[]): boolean {
        let flag = false;
        list.forEach((item: ResultDetail) => {
            const isNotTaken = this.penaltyService.isSelectedNotTaken(item.homeValue)
                || this.penaltyService.isSelectedNotTaken(item.awayValue)
                || (item.isNotTaken && _.includes(CheckedSettleDetermined, item.betType));
            item.isResultWarning = isNotTaken;
            if (!flag) {
                flag = isNotTaken;
            }
        });

        return flag;
    }

    private isInconsistentValue(list: ResultDetail[]) {
        const result = _.find(list, (item: ResultDetail) => item.isInvalidValue);
        return !_.isEmpty(result);
    }

    private isNotSettledHomeAway(resultDetails: ResultDetail[]) {
        return this.verifyService.isValidOnRound(resultDetails) || this.verifyService.isValidOnFirstTen(resultDetails);
    }

    private isEmptyResultValue(list: ResultDetail[]) {
        let flag = false;
        list.forEach((item: ResultDetail) => {
            const isEmpty = this.penaltyService.isEmptyHomeOrAwayValue(item);
            item.isResultWarning = isEmpty;
            if (!flag) {
                flag = isEmpty;
            }
        });

        return flag;
    }

    public isChangedScore(resultDetails: ResultDetail[], newResultDetails: ResultDetail[]) {
        const calculated = "Complete";
        const refunded = "Refund";
        let needConfirm = false;
        _.forEach(resultDetails, (result) => {
            const correspondingResult = _.find(newResultDetails, (item) => _.isEqual(item.resourceId, result.resourceId));
            if (correspondingResult && (_.includes(correspondingResult.resultStatus, refunded)
                    || _.includes(correspondingResult.resultStatus, calculated)
                    && (!_.isEqual(result.homeValue, correspondingResult.homeValue)
                        || !_.isEqual(result.awayValue, correspondingResult.awayValue)))) {
                needConfirm = true;
            }
        });

        return needConfirm;
    }
}