import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ResourcesIds } from '../constants';
import { ResultStatusId, SettlementStatusId } from '../../shared/constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';

@Injectable(
)
export class TennisService {

  constructor(private readonly intervalBackgroundPipe: IntervalBackgroundPipe) {
  }

  public getResultDetail(resultDetailList: ResultDetail[]): ResultDetail[] {
    let resultDetail = resultDetailList.filter((map) => map.resourceId.length < 5 && map.resourceId !== ResourcesIds.totalSets);
    const totalSets = resultDetailList.find((map) => map.resourceId === ResourcesIds.totalSets);
    const totalGames = new ResultDetail();
    totalGames.resourceId = ResourcesIds.totalGames;
    totalGames.ticketStatus = totalSets.ticketStatus;
    totalGames.resultSettingData = totalSets.resultSettingData;
    totalGames.resultStatusId = totalSets.resultStatusId;
    if (this.isRefundMatch(totalSets)) {
      totalGames.settlementStatusId = SettlementStatusId.Refund;
    } else {
      const games = resultDetail.filter((game) => !_.isEmpty(game.homeValue) && !_.isEmpty(game.awayValue)
        && (game.resultStatusId == ResultStatusId.ManualCompleted || game.resultStatusId == ResultStatusId.AutoCompleted));

      totalGames.settlementStatusId = totalSets.settlementStatusId;
      if (games.length > 0) {
        totalGames.homeValue = _.sumBy(games, (game) => Number(game.homeValue)).toString();
        totalGames.awayValue = _.sumBy(games, (game) => Number(game.awayValue)).toString();
      }
    }

    resultDetail = _.orderBy(resultDetail, (map) => map.ordNo);
    resultDetail.push(totalGames);
    resultDetail.push(totalSets);
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