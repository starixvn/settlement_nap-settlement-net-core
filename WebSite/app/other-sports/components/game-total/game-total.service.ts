import { Injectable } from '@angular/core';
import { ResultStatusId, SettlementStatusId } from '../../../shared/constants';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import * as _ from 'lodash';
import { ResourcesIds } from '../../constants';
import { Language } from '../../../shared/language.native';
import { ResourceNameByIdPipe } from '../../pipes/resource-name-by-id.pipe';
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';
@Injectable()
export class GameTotalService {
    constructor(
        private readonly intervalBackgroundPipe: IntervalBackgroundPipe,
        private readonly resourceNameByIdPipe: ResourceNameByIdPipe) { }

    getResultDetail(resultDetailList: ResultDetail[]): ResultDetail[] {
        const resultDetail = resultDetailList.filter((map) => map.resourceId.length < 5);
        const last = resultDetail.pop();
        const totalPoints = new ResultDetail();
        totalPoints.resourceId = ResourcesIds.totalPoints;
        totalPoints.ticketStatus = last.ticketStatus;
        if (this.isRefundMatch(last)) {
            totalPoints.settlementStatusId = SettlementStatusId.Refund;
        } else {
            const games = resultDetail.filter((game) => game.resourceId !== ResourcesIds.totalSets
                && !_.isEmpty(game.homeValue) && !_.isEmpty(game.awayValue)
                && game.settlementStatusId !== SettlementStatusId.Refund);

            totalPoints.settlementStatusId = last.settlementStatusId;
            if (games.length > 0) {
                totalPoints.homeValue = _.sumBy(games, (game) => Number(game.homeValue)).toString();
                totalPoints.awayValue = _.sumBy(games, (game) => Number(game.awayValue)).toString();
            }
        }

        resultDetail.push(totalPoints);
        resultDetail.push(last);
        return resultDetail;
    }

    private isRefundMatch(totalSets: ResultDetail) {
        return totalSets.resourceId === ResourcesIds.totalSets
            && totalSets.settlementStatusId === SettlementStatusId.Refund;
    }

    resetHomeAway(resultDetails: ResultDetail[], isLeader: boolean) {
        resultDetails.forEach((map) => {
            const showScore = (isLeader || map.settlementStatusId === SettlementStatusId.Calculated)
                && map.settlementStatusId !== SettlementStatusId.Refund;
            map.homeValue = showScore ? map.homeValue : "";
            map.awayValue = showScore ? map.awayValue : "";
        });
    }

    changeTotalPoints(resultDetailList: ResultDetail[]) {
        let finalHome = 0;
        let finalAway = 0;
        const withoutTotalSet = this.resultWithOutTotalSet(resultDetailList);

        for (const map of withoutTotalSet) {
            finalHome += Number(map.homeValue);
            finalAway += Number(map.awayValue);
        }
        const totalPoint = new ResultDetail();
        totalPoint.homeValue = finalHome.toString();
        totalPoint.awayValue = finalAway.toString();
        return totalPoint;
    }

    private resultWithOutTotalSet(resultDetailList: ResultDetail[]) {
        return _.filter(resultDetailList, item => item.resourceId !== ResourcesIds.totalSets);
    }

    computeTotalSets(resultDetailList: ResultDetail[]) {
        let homeSet = 0;
        let awaySet = 0;
        const withoutTotalSet = this.resultWithOutTotalSet(resultDetailList);

        withoutTotalSet.forEach(cur => {
            const home = Number(cur.homeValue);
            const away = Number(cur.awayValue);
            const sub = home - away;
            if (sub > 0) {
                homeSet++;
            } else if (sub < 0) {
                awaySet++;
            }
        });

        const totalSet = new ResultDetail();
        totalSet.homeValue = homeSet.toString();
        totalSet.awayValue = awaySet.toString();

        return totalSet;
    }

    getConfirmMessage(resultDetails: ResultDetail[]) {
        let confirmMessage = `${Language.CalculationConfirmMessage}<br/>${Language.CalculationAdditionalConfirmation}<br/>`;
        resultDetails.forEach((x: ResultDetail) => {
            const resourceName = this.resourceNameByIdPipe.transform(x.resourceId);
            const value = `${x.homeValue}-${x.awayValue}`;
            confirmMessage += `${resourceName}: ${value}<br/>`;
        });

        return confirmMessage;
    }

    getClass(resultDetail: ResultDetail) {
        let className = '';
        if (_.isEqual(resultDetail.resourceId, ResourcesIds.totalSets)) {
            className += 'final-score ';
        } else if (_.isEqual(resultDetail.resourceId, ResourcesIds.totalPoints)) {
            className += 'total-point ';
        }

        return className + this.intervalBackgroundPipe.transform(resultDetail.settlementStatusId);
    }

    isFTDrawWithInputNormal(totalGames: ResultDetail, inputDirectly: boolean) {
        return !inputDirectly && totalGames.homeValue.trim() === totalGames.awayValue.trim();
    }
}