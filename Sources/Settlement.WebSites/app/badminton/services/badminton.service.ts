import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { ResourcesIds } from '../constants';
import { SettlementStatusId } from '../../shared/constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultDetail } from '../../shared/models/sportsbook-sop';

@Injectable()
export class BadmintonService {
  constructor(private readonly intervalBackgroundPipe: IntervalBackgroundPipe) {
  }
  public getResultDetail(resultDetailList: ResultDetail[]): ResultDetail[] {
    const resultDetail = resultDetailList.filter((map) => map.resourceId.length < 5 && _.isNil(map.betTypeName));
    const last = resultDetail.pop();
    const totalPoints = new ResultDetail();
    totalPoints.resourceId = ResourcesIds.totalPoints;
    totalPoints.ticketStatus = last.ticketStatus;
    totalPoints.resultStatusId = last.resultStatusId;
    if (this.isRefundMatch(last)) {
      totalPoints.settlementStatusId = SettlementStatusId.Refund;
    } else {
      const games = resultDetail.filter((game) => game.resourceId !== ResourcesIds.totalGames
        && !_.isEmpty(game.homeValue) && !_.isEmpty(game.awayValue)
        && game.settlementStatusId !== SettlementStatusId.Refund);

      if (games.length > 0) {
        totalPoints.homeValue = _.sumBy(games, (game) => Number(game.homeValue)).toString();
        totalPoints.awayValue = _.sumBy(games, (game) => Number(game.awayValue)).toString();
      }
      totalPoints.settlementStatusId = last.settlementStatusId;
    }

    resultDetail.push(totalPoints);
    resultDetail.push(last);
    return resultDetail;
  }

  private isRefundMatch(totalGames: ResultDetail) {
    return totalGames.resourceId === ResourcesIds.totalGames
      && totalGames.settlementStatusId === SettlementStatusId.Refund;
  }

  public getIntervalBackground(settlementStatusId: number) {
    return this.intervalBackgroundPipe.transform(settlementStatusId);
  }

}