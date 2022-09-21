import { Injectable } from "@angular/core";
import { BetType, FastMarketResult, GetLastestResultQuery, ResultItem, SpecialSession } from "../models";
import * as _ from 'lodash';
import { TimeMachineAction, FastMarketBetType, Language, ResultStatus, SessionId, TicketStatus, TimeType, ErrorMessage } from "../constants";
import { ModalDialogMessage } from "../../shared/models";
import { MessageBoxService } from "../../shared/services";
import { TimeMachineService } from "./time-machine.service";
import { Observable } from "rxjs";
import { RequestService } from "./request.service";
import { map } from "rxjs/operators";

@Injectable()
export class VerificationService {
    private readonly halfTimeMinute = 45;
    public readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();

    constructor(
        private readonly messageBoxService: MessageBoxService,
        private readonly timeMachineService: TimeMachineService,
        private readonly requestService: RequestService) {
        this.warningDialogMessage.title = Language.confirmationBoxTitle;
    }

    public verifyBeforeCalculation(betTypes: BetType[], specialSessions: SpecialSession[], isRefundSDT = false) {
        if (!isRefundSDT && this.isSpecialSessionOverlapOnCalculation(betTypes, specialSessions)) {
            return "WARNING! Cannot continue due to invalid intervals selected. Please check with special sessions and try again.";
        } else if (this.isFailEventCounterValidationForCalculate(betTypes)) {
            return "The highlighted result is not consistent with the event counter, "
                + "please correct the result and try again.";
        } else if (this.isFailValidationForCalculate(betTypes, isRefundSDT)) {
            return "Please specific results in the highlighted intervals.";
        } else if (this.timeMachineService.validateBeforeCalculation(betTypes, TimeMachineAction.verifyCheckedInterval)) {
            return "WARNING! Cannot continue due to gaps between selections. Please select intervals in consecutive manner.";
        } else if (this.timeMachineService.validateBeforeCalculation(betTypes, TimeMachineAction.verifyPreviousInterval)) {
            return "WARNING! Cannot continue due to previous intervals are running or refunded. Please select them also and try again.";
        }

        return '';
    }

    private isFailEventCounterValidationForCalculate(betTypes: BetType[]) {
        let isFail = false;

        _.forEach(betTypes, (betType) => {
            _.forEach(betType.fastMarketResults, (item) => {
                if (this.isValidByBetType(item)) {
                    isFail = true;
                }
            });
        });

        return isFail;
    }

    private isValidByBetType(item: FastMarketResult) {
        return this.isOtherBetTypeValid(item);
    }

    private isOtherBetTypeValid(item: FastMarketResult) {
        return (item.validationItem && item.isShow && item.checked &&
            (!item.validationItem.goal || !item.validationItem.corner || !item.validationItem.freeKick
                || !item.validationItem.goalKick || !item.validationItem.throwIn
                || (item.betType === FastMarketBetType.nextFiveMinutes && !item.validationItem.penalty)));
    }

    private isFailValidationForCalculate(betTypes: BetType[], isRefundSDT: boolean) {
        let isFail = false;
        let isFirstTimeMachineResult = true;

        _.forEach(betTypes, (betType) => {
            _.forEach(betType.fastMarketResults, (item) => {
                if (item.betType === FastMarketBetType.timeMachineOverUnder && isRefundSDT) {
                    if (isFail) {
                        return;
                    }

                    if (this.isFirstTimeMachineOUIntervalChecked(isFirstTimeMachineResult, item)) {
                        isFail = item.hasBackground;
                        isFirstTimeMachineResult = false;
                    }
                } else if (this.isRefundSDTWithTimeMachineHDP(item, isRefundSDT)) {
                    return;
                } else if (item.hasBackground && item.isShow) {
                    isFail = true;
                }
            });
        });

        return isFail;
    }

    private isFirstTimeMachineOUIntervalChecked(isFirstTimeMachineResult: boolean, item: FastMarketResult) {
        return isFirstTimeMachineResult && item.checked && item.isShow;
    }

    private isRefundSDTWithTimeMachineHDP(item: FastMarketResult, isRefundSDT) {
        return item.betType === FastMarketBetType.timeMachineHDP && isRefundSDT;
    }

    private isSpecialSessionOverlapOnCalculation(betTypes: BetType[], specialSessions: SpecialSession[]) {
        let isInvalid = false;
        const waterBreaks = specialSessions.filter((session) => !_.isEqual(session.resourceId, SessionId.suspendedTime));
        const suspendedTime = specialSessions.find((session) => _.isEqual(session.resourceId, SessionId.suspendedTime));
        _.forEach(betTypes, (betType) => {
            if (betType.betTypeId === FastMarketBetType.timeMachineOverUnder
                || betType.betTypeId === FastMarketBetType.timeMachineHDP) {
                if (suspendedTime) {
                    isInvalid = this.isTimeMachineBetTypeOverlapOnCalculation(betType, suspendedTime, isInvalid);
                }
            } else {
                if (waterBreaks.length > 0) {
                    isInvalid = this.isOtherBetTypeOverlapWaterBreakOnCalculation(betType, waterBreaks, isInvalid);
                }

                if (suspendedTime) {
                    isInvalid = this.isOtherBetTypeOverlapSuspendedOnCalculation(betType, suspendedTime, isInvalid);
                }
            }
        });

        return isInvalid;
    }

    private isTimeMachineBetTypeOverlapOnCalculation(betType: BetType, suspendedTime: SpecialSession, isInvalid: boolean) {
        const isOverlap = _.some(betType.fastMarketResults, (result) => {
            const endMinute = result.position === this.halfTimeMinute
                ? this.halfTimeMinute : this.getIntervalTime(result.positionName, TimeType.endMinute);
            const endSecond = result.position === this.halfTimeMinute
                ? 0 : this.getIntervalTime(result.positionName, TimeType.endSecond);

            return result.isShow && result.checked
                && (endMinute > suspendedTime.startMinute
                || endMinute === suspendedTime.startMinute && endSecond >= suspendedTime.startSecond);
        });

        return isOverlap ? isOverlap : isInvalid;
    }

    private isOtherBetTypeOverlapWaterBreakOnCalculation(betType: BetType, waterBreaks: SpecialSession[], isInvalid: boolean) {
        const isOverlap = _.some(betType.fastMarketResults, (result) => {
            const endMinute = this.getIntervalTime(result.positionName, TimeType.endMinute);
            const endSecond = this.getIntervalTime(result.positionName, TimeType.endSecond);
            const startMinute = this.getIntervalTime(result.positionName, TimeType.startMinute);
            const startSecond = this.getIntervalTime(result.positionName, TimeType.startSecond);
            return _.some(waterBreaks, (waterBreak) =>
                result.isShow && result.checked
                    && (this.isIntervalInsideWaterBreak(startMinute, startSecond, waterBreak)
                    || this.isIntervalInsideWaterBreak(endMinute, endSecond, waterBreak)
                    || this.isWaterBreakInsideInterval(startMinute, startSecond, endMinute, endSecond, waterBreak))
            );
        });

        return isOverlap ? isOverlap : isInvalid;
    }

    private isIntervalInsideWaterBreak(minute: number, second: number, waterBreak: SpecialSession) {
        return (minute > waterBreak.startMinute
                || minute === waterBreak.startMinute && second >= waterBreak.startSecond)
            && (minute < waterBreak.endMinute
                || minute === waterBreak.endMinute && second <= waterBreak.endSecond);
    }

    private isWaterBreakInsideInterval(startMinute: number, startSecond: number,
        endMinute: number, endSecond: number, waterBreak: SpecialSession) {
            return (startMinute < waterBreak.startMinute
                    || startMinute === waterBreak.startMinute && startSecond <= waterBreak.startSecond)
                && (endMinute > waterBreak.endMinute
                    || endMinute === waterBreak.endMinute && endSecond >= waterBreak.endSecond);
    }

    private isOtherBetTypeOverlapSuspendedOnCalculation(betType: BetType, suspendedTime: SpecialSession, isInvalid) {
        const isOverlap = _.some(betType.fastMarketResults, (result) => {
            const endMinute = this.getIntervalTime(result.positionName, TimeType.endMinute);
            const endSecond = this.getIntervalTime(result.positionName, TimeType.endSecond);
            const startMinute = this.getIntervalTime(result.positionName, TimeType.startMinute);
            const startSecond = this.getIntervalTime(result.positionName, TimeType.startSecond);
            return result.isShow && result.checked
                && this.isIntervalBehindSuspended(startMinute, startSecond, endMinute, endSecond, suspendedTime);
        });

        return isOverlap ? isOverlap : isInvalid;
    }

    private isIntervalBehindSuspended(startMinute: number, startSecond: number,
        endMinute: number, endSecond: number, suspendedTime: SpecialSession) {
        return (endMinute > suspendedTime.startMinute
                || endMinute === suspendedTime.startMinute && endSecond >= suspendedTime.startSecond)
                && (startMinute < suspendedTime.startMinute
                || startMinute === suspendedTime.startMinute && startSecond <= suspendedTime.startSecond)
            || startMinute > suspendedTime.startMinute
            || startMinute === suspendedTime.startMinute && startSecond > suspendedTime.startSecond;
    }

    public verifyBeforeUncalculation(betTypes: BetType[]) {
        if (this.timeMachineService.validateBeforeUncalculation(betTypes, TimeMachineAction.verifyPreviousInterval)) {
            return "WARNING! Cannot continue due to prior intervals have been refunded. Please select them also and try again.";
        } else if (this.timeMachineService.validateBeforeUncalculation(betTypes, TimeMachineAction.verifyFollowingInterval)) {
            this.warningDialogMessage.message = "WARNING! Settled subsequent intervals must also be uncalculated. Do you want to auto select them also?";
            this.messageBoxService.confirm(this.warningDialogMessage, () => {
                this.autoCheckUncalculation(betTypes);
            });
            return ErrorMessage.notShowAlert;
        }

        return '';
    }

    private autoCheckUncalculation(betTypes: BetType[]) {
        if (this.timeMachineService.isTimeMachineOUFailOnUncalculation(betTypes, TimeMachineAction.verifyFollowingInterval)) {
            const timeMachineBetType = this.timeMachineService.getTimeMachineOUBetType(betTypes);
            this.selectForUncalculation(timeMachineBetType);
        }

        if (this.timeMachineService.isTimeMachineHDPFailOnUncalculation(betTypes, TimeMachineAction.verifyFollowingInterval)) {
            const timeMachineBetType = this.timeMachineService.getTimeMachineHDPBetType(betTypes);
            this.selectForUncalculation(timeMachineBetType);
        }
    }

    private selectForUncalculation(timeMachineBetType: BetType) {
        const startPosition = this.timeMachineService.getFirstCheckedPosition(timeMachineBetType);
        _.forEach(timeMachineBetType.fastMarketResults, (interval) => {
            if (interval.position > startPosition && this.timeMachineService.isIntervalSettled(interval)) {
                interval.checked = true;
            }
        });
    }

    public verifyBeforeRefund(betTypes: BetType[], isRefundSDT = false) {
        if (this.timeMachineService.validateBeforeRefund(betTypes, TimeMachineAction.verifyOverUnder) && !isRefundSDT) {
            this.warningDialogMessage.message = "WARNING! All Saba OU Time Machine intervals must be refunded as well. Do you want to auto select them?";
            this.messageBoxService.confirm(this.warningDialogMessage, () => {
                this.autoCheckRefundOverUnder(betTypes);
            });

            return ErrorMessage.notShowAlert;
        } else if (this.timeMachineService.validateBeforeRefund(betTypes, TimeMachineAction.verifyPreviousInterval)) {
            return "WARNING! Cannot continue due to prior intervals are running. Please select them also and try again.";
        } else if (this.timeMachineService.validateBeforeRefund(betTypes, TimeMachineAction.verifyFollowingInterval, isRefundSDT)) {
            this.warningDialogMessage.message = "WARNING! All refunded and subsequent intervals must be refunded as well. Do you want to auto select them?";
            this.messageBoxService.confirm(this.warningDialogMessage, () => {
                this.autoCheckRefund(betTypes);
            });

            return ErrorMessage.notShowAlert;
        }

        return '';
    }

    private autoCheckRefundOverUnder(betTypes: BetType[]) {
        const timeMachineBetType = this.timeMachineService.getTimeMachineOUBetType(betTypes);
        _.forEach(timeMachineBetType.fastMarketResults, (interval) =>{
            interval.checked = true;
        });
    }

    private autoCheckRefund(betTypes: BetType[]) {
        if (this.timeMachineService.isTimeMachineOUFailOnRefund(betTypes, TimeMachineAction.verifyFollowingInterval)) {
            const timeMachineBetType = this.timeMachineService.getTimeMachineOUBetType(betTypes);
            const startPosition = this.timeMachineService.getFirstCheckedPosition(timeMachineBetType);
            _.forEach(timeMachineBetType.fastMarketResults, (interval) => {
                if ((interval.position > startPosition)
                    || interval.resultStatus === ResultStatus.refund || interval.resultStatus === ResultStatus.refundWithDetermined) {
                    interval.checked = true;
                }
            });
        }

        if (this.timeMachineService.isTimeMachineHDPFailOnRefund(betTypes, TimeMachineAction.verifyFollowingInterval)) {
            const timeMachineBetType = this.timeMachineService.getTimeMachineHDPBetType(betTypes);
            const startPosition = this.timeMachineService.getFirstCheckedPosition(timeMachineBetType);
            _.forEach(timeMachineBetType.fastMarketResults, (interval) => {
                if (interval.position > startPosition || interval.resultStatus === ResultStatus.refund) {
                    interval.checked = true;
                }
            });
        }

    }

    public verifyBeforeRefundSDT(betTypes: BetType[], specialSessions: SpecialSession[]) {
        if (!this.isAppliedSpecialSessionExist(specialSessions, betTypes)
            || this.isSpecialSessionOverlapOnRefundSDT(betTypes, specialSessions)) {
            return "WARNING! Cannot continue due to invalid intervals selected. Please check with special sessions and try again.";
        }

        return '';
    }

    private isAppliedSpecialSessionExist(specialSessions: SpecialSession[], betTypes: BetType[]) {
        const suspendedTime = specialSessions.find((session) => _.isEqual(session.resourceId, SessionId.suspendedTime));
        const isTimeMachineIntervalExist = _.some(betTypes, (betType) => _.some(betType.fastMarketResults, (result) =>
            (result.betType === FastMarketBetType.timeMachineOverUnder || result.betType === FastMarketBetType.timeMachineHDP)
            && result.checked && result.isShow)
        );

        if (isTimeMachineIntervalExist) {
            return suspendedTime && suspendedTime.apply;
        }

        return _.some(specialSessions, (session) => session.apply);
    }

    private isSpecialSessionOverlapOnRefundSDT(betTypes: BetType[], specialSessions: SpecialSession[]) {
        let isInvalid = false;
        const waterBreaks = specialSessions.filter((session) => !_.isEqual(session.resourceId, SessionId.suspendedTime));
        const suspendedTime = specialSessions.find((session) => _.isEqual(session.resourceId, SessionId.suspendedTime));
        _.forEach(betTypes, (betType) => {
            if (betType.betTypeId === FastMarketBetType.timeMachineOverUnder || betType.betTypeId === FastMarketBetType.timeMachineHDP) {
                if (suspendedTime) {
                    isInvalid = this.isTimeMachineBetTypeOverlapOnRefundSDT(betType, suspendedTime, isInvalid);
                }
            } else {
                if (suspendedTime && waterBreaks.length > 0) {
                    isInvalid = this.isOtherBetTypeConfictWaterBreakAndSuspendedOnRefundSDT(betType, suspendedTime, isInvalid, waterBreaks);
                } else if (suspendedTime) {
                    isInvalid = this.isOtherBetTypeOverlapSuspendedOnRefundSDT(betType, suspendedTime, isInvalid);
                } else if (waterBreaks.length > 0) {
                    isInvalid = this.isOtherBetTypeOverlapWaterBreakOnRefundSDT(betType, waterBreaks, isInvalid);
                }
            }
        });

        return isInvalid;
    }

    private isOtherBetTypeOverlapWaterBreakOnRefundSDT(betType: BetType, waterBreaks: SpecialSession[], isInvalid: boolean) {
        const isOverlap = _.some(betType.fastMarketResults, (result) => {
            const endMinute = this.getIntervalTime(result.positionName, TimeType.endMinute);
            const endSecond = this.getIntervalTime(result.positionName, TimeType.endSecond);
            const startMinute = this.getIntervalTime(result.positionName, TimeType.startMinute);
            const startSecond = this.getIntervalTime(result.positionName, TimeType.startSecond);
            return _.every(waterBreaks, (waterBreak) => result.isShow && result.checked
                    && (endMinute < waterBreak.startMinute
                    || endMinute === waterBreak.startMinute && endSecond < waterBreak.startSecond
                    || startMinute > waterBreak.endMinute
                    || startMinute === waterBreak.endMinute && startSecond > waterBreak.endSecond));
        });

        return isOverlap ? isOverlap : isInvalid;
    }

    private isTimeMachineBetTypeOverlapOnRefundSDT(betType: BetType, suspendedTime: SpecialSession, isInvalid: boolean) {
        const isOverlap = _.some(betType.fastMarketResults, (result) => {
            const endMinute = result.position === this.halfTimeMinute
                ? this.halfTimeMinute : this.getIntervalTime(result.positionName, TimeType.endMinute);
            const endSecond = result.position === this.halfTimeMinute
                ? 0 : this.getIntervalTime(result.positionName, TimeType.endSecond);
            return result.isShow && result.checked
                && (endMinute < suspendedTime.startMinute
                || endMinute === suspendedTime.startMinute && endSecond < suspendedTime.startSecond);
        });

        return isOverlap ? isOverlap : isInvalid;
    }

    private isOtherBetTypeOverlapSuspendedOnRefundSDT(betType: BetType, suspendedTime: SpecialSession, isInvalid: boolean) {
        const isOverlap = _.some(betType.fastMarketResults, (result) => {
            const endMinute = this.getIntervalTime(result.positionName, TimeType.endMinute);
            const endSecond = this.getIntervalTime(result.positionName, TimeType.endSecond);
            const startMinute = this.getIntervalTime(result.positionName, TimeType.startMinute);
            const startSecond = this.getIntervalTime(result.positionName, TimeType.startSecond);
            return result.isShow && result.checked
                && this.isIntervalOutOfSuspended(startMinute, startSecond, endMinute, endSecond, suspendedTime);
        });

        return isOverlap ? isOverlap : isInvalid;
    }

    private isOtherBetTypeConfictWaterBreakAndSuspendedOnRefundSDT(betType: BetType, suspendedTime: SpecialSession,
        isInvalid: boolean, waterBreaks: SpecialSession[]) {
        const isOverlap = _.some(betType.fastMarketResults.filter(x => x.checked), (result) => {
            const endMinute = this.getIntervalTime(result.positionName, TimeType.endMinute);
            const endSecond = this.getIntervalTime(result.positionName, TimeType.endSecond);
            const startMinute = this.getIntervalTime(result.positionName, TimeType.startMinute);
            const startSecond = this.getIntervalTime(result.positionName, TimeType.startSecond);
            return _.every(waterBreaks, (waterBreak) => result.isShow && result.checked
                && this.isIntervalOutOfSuspended(startMinute, startSecond, endMinute, endSecond, suspendedTime)
                && !this.isIntervalInsideWaterBreak(startMinute, startSecond, waterBreak)
                && !this.isIntervalInsideWaterBreak(endMinute, endSecond, waterBreak)
                && !this.isWaterBreakInsideInterval(startMinute, startSecond, endMinute, endSecond, waterBreak));
        });

        return isOverlap ? isOverlap : isInvalid;
    }

    private isIntervalOutOfSuspended(startMinute: number, startSecond: number,
        endMinute: number, endSecond: number, suspendedTime: SpecialSession) {
        return endMinute < suspendedTime.startMinute
            || endMinute === suspendedTime.startMinute && endSecond < suspendedTime.startSecond
            || startMinute > suspendedTime.startMinute
            || startMinute === suspendedTime.startMinute && startSecond > suspendedTime.startSecond;
    }

    private getIntervalTime(positionName: string, timeType: number) {
        const timeLength = 2;
        const startMinutePosition = 0;
        const startSecondPosition = 3;
        const endMinutePosition = 6;
        const endSecondPosition = 9;
        if (timeType === TimeType.startMinute) {
            return Number(positionName.substr(startMinutePosition, timeLength));
        } else if (timeType === TimeType.startSecond) {
            return Number(positionName.substr(startSecondPosition, timeLength));
        } else if (timeType === TimeType.endMinute) {
            return Number(positionName.substr(endMinutePosition, timeLength));
        } else {
            return Number(positionName.substr(endSecondPosition, timeLength));
        }
    }

    public verifyChangedSettledTickets(betTypes: BetType[], query: GetLastestResultQuery)
        : Observable<boolean> {
        const resultDetails = this.groupFastMarketResultDetail(betTypes);

        return this.requestService.getLastestResult(query).pipe(map((lastestResults: FastMarketResult[]) => {
          let needConfirm = false;
          _.forEach(resultDetails, (resultDetail) => {
            const correspondingResult = _.find(lastestResults, (item) => item.betType === resultDetail.betType
                && item.position === resultDetail.position);
            if (correspondingResult
                && (correspondingResult.resultStatus === ResultStatus.refund
                    || correspondingResult.resultStatus === ResultStatus.refundWithDetermined
                    || (correspondingResult.resultStatus === ResultStatus.completedAuto
                        || correspondingResult.resultStatus === ResultStatus.completedManual)
                        && !_.isEmpty(correspondingResult.result?.toString())
                        && this.isResultsDifferent(resultDetail, correspondingResult, resultDetail.betType))) {
                needConfirm = true;
            }
          });

          return needConfirm;
        }));
    }

    private groupFastMarketResultDetail(betTypes: BetType[]) {
        const resultDetails: FastMarketResult[] = [];
        _.forEach(betTypes, (betType) => {
            _.forEach(betType.fastMarketResults, (result) => {
                if (result.checked && result.isShow) {
                    resultDetails.push(result);
                }
            });
        });

        return resultDetails;
    }

    private isResultsDifferent(oldResult: FastMarketResult, newResult: FastMarketResult, betType: number) {
        if (betType === FastMarketBetType.timeMachineOverUnder) {
            return !_.isEqual(oldResult.result?.toString(), newResult.result?.toString());
        } else if (betType === FastMarketBetType.timeMachineHDP) {
            return !_.isEqual(oldResult.homeGoal?.toString(), newResult.homeGoal?.toString())
                || !_.isEqual(oldResult.awayGoal?.toString(), newResult.awayGoal?.toString());
        } else {
            return this.compareResult(oldResult, newResult);
        }
    }

    private compareResult(oldResult: FastMarketResult, newResult: FastMarketResult) {
        return oldResult.resultItem.none !== newResult.resultItem.none
        || oldResult.resultItem.goal !== newResult.resultItem.goal
        || oldResult.resultItem.corner !== newResult.resultItem.corner
        || oldResult.resultItem.freeKick !== newResult.resultItem.freeKick
        || oldResult.resultItem.goalKick !== newResult.resultItem.goalKick
        || oldResult.resultItem.throwIn !== newResult.resultItem.throwIn
        || oldResult.resultItem.bookings !== newResult.resultItem.bookings
        || oldResult.resultItem.penalty !== newResult.resultItem.penalty;
    }

}