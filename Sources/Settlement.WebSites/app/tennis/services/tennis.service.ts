import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ResourcesIds } from '../constants';
import { SettlementStatusId } from '../../shared/constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';

@Injectable()
export class TennisService {

  constructor(private readonly intervalBackgroundPipe: IntervalBackgroundPipe) {
  }

  public getResultDetail(resultDetailList: ResultDetail[]): ResultDetail[] {
    const resultDetail = resultDetailList.filter((map) => map.resourceId.length < 5);
    const last = resultDetail.pop();
    const totalGames = new ResultDetail();
    totalGames.resourceId = ResourcesIds.totalGames;
    totalGames.ticketStatus = last.ticketStatus;
    totalGames.resultSettingData = last.resultSettingData;
    totalGames.resultStatusId = last.resultStatusId;
    if (this.isRefundMatch(last)) {
      totalGames.settlementStatusId = SettlementStatusId.Refund;
    } else {
      const games = resultDetail.filter((game) => game.resourceId !== ResourcesIds.totalSets
        && !_.isEmpty(game.homeValue) && !_.isEmpty(game.awayValue)
        && game.settlementStatusId !== SettlementStatusId.Refund);

      totalGames.settlementStatusId = last.settlementStatusId;
      if (games.length > 0) {
        totalGames.homeValue = _.sumBy(games, (game) => Number(game.homeValue)).toString();
        totalGames.awayValue = _.sumBy(games, (game) => Number(game.awayValue)).toString();
      }
    }

    resultDetail.push(totalGames);
    resultDetail.push(last);
    return resultDetail;
  }

  private isRefundMatch(totalGames: ResultDetail) {
    return totalGames.resourceId === ResourcesIds.totalSets
      && totalGames.settlementStatusId === SettlementStatusId.Refund;
  }

  public getIntervalBackground(settlementStatusId: number) {
    return this.intervalBackgroundPipe.transform(settlementStatusId);
  }
}