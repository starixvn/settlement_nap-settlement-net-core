import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ResultControl, ResultControlGroup } from '../constants';
import { ResultDetail, GroupMap, MatchDetail } from '../../shared/models/sportsbook-sop';
import { Language } from '../../shared/language';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { EarlyBaseService } from '../../core/services/early-base.service';
@Injectable()
export class EarlyConstraintService extends EarlyBaseService {
    constructor(private readonly resultByTeamNamePipe: ResultByTeamNamePipe) {
        super();
    }

    public isInValidDuration(resultDetail: ResultDetail[]) {
        const resultWarning = _.find(resultDetail, (x: ResultDetail) => x.isDurationWarning);
        return !_.isEmpty(resultWarning);
    }

    public verifyResultValueForBetType(resultDetail: ResultDetail[]) {
        resultDetail.forEach((item: ResultDetail) => {
            if (this.isBetTypeOnGroup(ResultControl.CoupleScores, item.betType)) {
                item.isResultWarning = this.isEmptyHomeOrAwayValue(item);
            } else if (this.isBetTypeOnGroup(ResultControl.Duration, item.betType)) {
                if (this.isEmptyHomeOrAwayValue(item)) {
                    item.isResultWarning = true;
                } else {
                    item.isResultWarning = false;
                    item.isDurationWarning = this.isRangeDuration(Number(item.awayValue));
                }
            } else {
                item.isResultWarning = this.isEmptyHome(item);
            }
        });
    }

    private isRangeDuration(value: number) {
        return Number(value) < 0 || Number(value) > 59;
    }

    private isEmptyHomeOrAwayValue(item: ResultDetail) {
        return item.homeValue === null || _.isEmpty(item.homeValue)
            || item.awayValue === null || _.isEmpty(item.awayValue);
    }

    public getGroupMap(resultDetail: ResultDetail[]) {
        const list = _.uniqBy(resultDetail, (item) => item.map);
        const maps: GroupMap[] = [];

        list.forEach((item) => {
            const newResultDetail = resultDetail.filter((x) => x.map === item.map);
            maps.push(new GroupMap(`Map ${item.map}`, newResultDetail));
        });
        maps.forEach(item => item.isHoldResult = item.resultDetail.every(i => i.resultSettingData.isHoldResult));

        return maps;
    }

    public getBetTypeGroup(betType: string) {
        if (this.isBetTypeOnGroup(ResultControl.HomeAway, betType)) {
            return ResultControlGroup.HomeAway;
        } else if (this.isBetTypeOnGroup(ResultControl.HomeAwayDraw, betType)) {
            return ResultControlGroup.HomeAwayDraw;
        } else if (this.isBetTypeOnGroup(ResultControl.YesNo, betType)) {
            return ResultControlGroup.YesNo;
        } else if (this.isBetTypeOnGroup(ResultControl.CoupleScores, betType)) {
            return ResultControlGroup.CoupleScores;
        } else if (this.isBetTypeOnGroup(ResultControl.Duration, betType)) {
            return ResultControlGroup.Duration;
        } else if (this.isBetTypeOnGroup(ResultControl.MidNotMid, betType)) {
            return ResultControlGroup.MidNotMid;
        } else if (this.isBetTypeOnGroup(ResultControl.SingleScore, betType)) {
            return ResultControlGroup.SingleScore;
        } else if (this.isBetTypeOnGroup(ResultControl.TopBottomNone, betType)) {
            return ResultControlGroup.TopBottomNone;
        }

        return this.getOtherBetTypeGroup(betType);
    }

    private getOtherBetTypeGroup(betType: string) {
        if (this.isBetTypeOnGroup(ResultControl.TopNotTop, betType)) {
            return ResultControlGroup.TopNotTop;
        } else if (this.isBetTypeOnGroup(ResultControl.BottomNotBottom, betType)) {
            return ResultControlGroup.BottomNotBottom;
        } else if (this.isBetTypeOnGroup(ResultControl.OverlordTyrant, betType)) {
            return ResultControlGroup.OverlordTyrant;
        } else if (this.isBetTypeOnGroup(ResultControl.TyrantNotTyrant, betType)) {
            return ResultControlGroup.TyrantNotTyrant;
        } else if (this.isBetTypeOnGroup(ResultControl.YesNoNone, betType)) {
            return ResultControlGroup.YesNoNone;
        }

        return ResultControlGroup.HomeAwayNone;
    }

    private isBetTypeOnGroup(groupBetType: string[], betType: string) {
        return _.includes(groupBetType, betType);
    }

    public getConfirmMessage(resultDetails: ResultDetail[], matchDetail: MatchDetail) {
        let confirmMessage = `${Language.CalculationConfirmMessageEarly}<br/>`;
        resultDetails.forEach((map: ResultDetail) => {
            let value: string;
            if (map.groupBetType === ResultControlGroup.CoupleScores) {
                value = `&nbsp${matchDetail.homeName}(${map.homeValue}) - ${matchDetail.awayName}(${map.awayValue})`;
            } else if (map.groupBetType === ResultControlGroup.SingleScore) {
                value = map.homeValue;
            } else if (map.groupBetType === ResultControlGroup.Duration) {
                value = `${map.homeValue}:${map.awayValue}`;
            } else {
                value = this.resultByTeamNamePipe.transform(map.homeValue, matchDetail, map.groupBetType);
            }

            confirmMessage += `${map.betTypeName}: ${value}<br/>`;
        });

        return confirmMessage;
    }
}