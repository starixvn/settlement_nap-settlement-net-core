import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { ResourcesIds } from '../constants';
import { ResultStatusId, SettlementStatusId } from '../../shared/constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { Match } from "../models";
import { SportType } from "../../shared/constants";

@Injectable()
export class BadmintonService {
  constructor(private readonly intervalBackgroundPipe: IntervalBackgroundPipe) {
  }
  public getResultDetail(resultDetailList: ResultDetail[]): ResultDetail[] {
    let resultDetail = resultDetailList.filter((map) => map.resourceId.length < 5 && _.isNil(map.betTypeName) && map.resourceId !== ResourcesIds.totalGames);
    const last = resultDetailList.find((map) => map.resourceId === ResourcesIds.totalGames);
    const totalPoints = new ResultDetail();
    totalPoints.resourceId = ResourcesIds.totalPoints;
    totalPoints.ticketStatus = last.ticketStatus;
    totalPoints.resultStatusId = last.resultStatusId;
    if (this.isRefundMatch(last)) {
      totalPoints.settlementStatusId = SettlementStatusId.Refund;
    } else {
      const games = resultDetail.filter((game) => game.resourceId !== ResourcesIds.totalGames
        && !_.isEmpty(game.homeValue) && !_.isEmpty(game.awayValue)
        && game.resultStatusId == ResultStatusId.ManualCompleted);

      if (games.length > 0) {
        totalPoints.homeValue = _.sumBy(games, (game) => Number(game.homeValue)).toString();
        totalPoints.awayValue = _.sumBy(games, (game) => Number(game.awayValue)).toString();
      }
      totalPoints.settlementStatusId = last.settlementStatusId;
    }

    resultDetail = _.orderBy(resultDetail, map => map.ordNo);
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

  public getBetStatus(isUnCal: boolean, match: Match) {
    if (match.matchDetail.sportType !== SportType.volleyBall) {
        return null;
    }

    const betStatus: string[] = [];
    const refund = !match.resultDetails.find((map) => map.resourceId === ResourcesIds.totalGames).checked
      && match.matchDetail.betStatus
      && _.includes(match.matchDetail.betStatus, 'Refund')
      ? 'Refund;' : '';
    if (!match.isScoreDirect) {
      const submitedSets = match.resultDetails.filter((map) =>
        map.resourceId !== ResourcesIds.totalPoints && map.resourceId !== ResourcesIds.totalGames);
      submitedSets.forEach((map) => {
        betStatus.push(map.checked
          ? !isUnCal ? `${Number(map.homeValue)}-${Number(map.awayValue)}` : `0-0`
          : `${Number(map.originalHomeValue)}-${Number(map.originalAwayValue)}`);
      });
    }

    return refund + betStatus.join(',');
}

}