import { Pipe, PipeTransform } from '@angular/core';
import { FastMarketResult, SpecialSession } from "../models";
import { FastMarketBetType, SessionId } from '../constants';
import * as _ from 'lodash';
@Pipe({
    name: 'specialTimeFilter',
})

export class SpecialTimePipe implements PipeTransform {
    public transform(fastMarketItems: FastMarketResult[], session: SpecialSession) {
        if (session.apply) {
            if (_.isEqual(session.resourceId, SessionId.suspendedTime)) {
                return this.filterSuspendedTime(fastMarketItems, session);
            } else {
                return this.filterWaterBreak(fastMarketItems, session);
            }
        } else {
            return fastMarketItems;
        }
    }

    private filterSuspendedTime(fastMarketItems: FastMarketResult[], session: SpecialSession) {
        return fastMarketItems.filter((item) => {
            if (item.betType === FastMarketBetType.timeMachineOverUnder
                || item.betType === FastMarketBetType.timeMachineHDP) {
                return this.filterTimeMachineBetType(item, session);
            } else if (this.isOneMinuteBetType(item)) {
                return this.filterOneMinuteBetTypes(item, session);
            } else {
                return this.filterFiveMinuteBetTypes(item, session);
            }
        });
    }

    private filterWaterBreak(fastMarketItems: FastMarketResult[], session: SpecialSession) {
        return fastMarketItems.filter((item) => {
            if (item.betType === FastMarketBetType.timeMachineOverUnder
                || item.betType === FastMarketBetType.timeMachineHDP) {
                return this.setResultFilter(item, false);
            } else if (this.isOneMinuteBetType(item)) {
                return this.filterOneMinuteWaterBreak(item, session);
            } else {
                return this.filterFiveMinuteWaterBreak(item, session);
            }
        });
    }

    private setResultFilter(item: FastMarketResult, isShow: boolean) {
        item.isShow = isShow;
        item.checked = isShow;

        return isShow;
    }

    private filterOneMinuteWaterBreak(item: FastMarketResult, waterBreakTime: SpecialSession) {
        if (waterBreakTime.startMinute === waterBreakTime.endMinute) {
            if (Number(item.position.toString()) === Number(waterBreakTime.startMinute.toString())) {
                return this.setResultFilter(item, true);
            } else {
                return this.setResultFilter(item, false);
            }
        } else {
            if (item.position >= waterBreakTime.startMinute && item.position <= waterBreakTime.endMinute) {
                return this.setResultFilter(item, true);
            } else {
                return this.setResultFilter(item, false);
            }
        }
    }

    private filterFiveMinuteWaterBreak(item: FastMarketResult, waterBreakTime: SpecialSession) {
        if (waterBreakTime.startMinute === waterBreakTime.endMinute) {
            if (item.position > waterBreakTime.startMinute - 5 && item.position <= waterBreakTime.startMinute) {
                return this.setResultFilter(item, true);
            } else {
                return this.setResultFilter(item, false);
            }
        } else {
            if (item.position > waterBreakTime.startMinute - 5 && item.position <= waterBreakTime.endMinute) {
                return this.setResultFilter(item, true);
            } else {
                return this.setResultFilter(item, false);
            }
        }
    }

    private filterTimeMachineBetType(item: FastMarketResult, suspendedTime: SpecialSession) {
        const suspendedMinute = this.calculateSuspendedMinuteForTimeMachine(suspendedTime);

        if (item.position >= suspendedMinute) {
            return this.setResultFilter(item, true);
        } else {
            return this.setResultFilter(item, false);
        }
    }

    private filterOneMinuteBetTypes(item: FastMarketResult, suspendedTime: SpecialSession) {
        if (Number(item.position.toString()) === Number(suspendedTime.startMinute.toString())) {
            return this.setResultFilter(item, true);
        } else {
            return this.setResultFilter(item, false);
        }
    }

    private calculateSuspendedMinuteForTimeMachine(suspendedTime: SpecialSession) {
        const halfTime = 45;
        let suspendedMinute = Number(suspendedTime.startMinute);
        if (Number(suspendedTime.startSecond) === 0) {
            if (Number(suspendedTime.startMinute) <= halfTime) {
                suspendedMinute -= 1;
            }
        } else {
            if (Number(suspendedTime.startMinute) >= halfTime) {
                suspendedMinute += 1;
            }
        }

        return suspendedMinute;
    }

    private filterFiveMinuteBetTypes(item: FastMarketResult, suspendedTime: SpecialSession) {
        if (item.position > suspendedTime.startMinute - 5 && item.position <= suspendedTime.startMinute) {
            return this.setResultFilter(item, true);
        } else {
            return this.setResultFilter(item, false);
        }
    }

    private isOneMinuteBetType(item: FastMarketResult) {
        return item.betType === FastMarketBetType.nextOneMinute
            || item.betType === FastMarketBetType.nextOneMinuteSetPiece
            || item.betType === FastMarketBetType.firstNextOneMinute
            || item.betType === FastMarketBetType.combinationNextOneMinute;
    }
}