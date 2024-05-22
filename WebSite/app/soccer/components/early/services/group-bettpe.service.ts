import * as _ from 'lodash';
import { ResultDetail, GroupMap, Score } from '../../../models/index';
import { Injectable } from '@angular/core';
import { AutoFillService } from './auto-fill.service';
import { PenaltyShootoutService } from './penalty-shootout.service';
import { PenaltyShootout1x2Service } from './penalty-shootout1x2.service';
import { PenaltyShootoutBothOneNeitherService } from './penalty-shootout-both-one-neither.service';
import { PenaltyWoodWorkService } from './penalty-wood-work.service';
import { BetTypes, CheckedSettleDetermined } from '../../../constants';
import { SettlementStatusId } from '../../../../shared/constants';

@Injectable()
export class GroupBetTypeService {
  constructor(
    public autoFillService: AutoFillService,
    public penaltyService: PenaltyShootoutService,
    public penaltyWoodWorkService: PenaltyWoodWorkService,
    public penalty1x2Service: PenaltyShootout1x2Service,
    public penaltyBothOneNeitherService: PenaltyShootoutBothOneNeitherService) {
  }

  public getGroupBetType(resultDetail: ResultDetail[]) {
    const listPenaltyShootoutRound = this.penaltyService.listPenaltyShootoutRound(resultDetail);
    const homeScoreFirstTen = this.penaltyService.countHomePenaltyShooutoutByScore(listPenaltyShootoutRound);
    const awayScoreFirstTen = this.penaltyService.countAwayPenaltyShooutoutByScore(listPenaltyShootoutRound);
    const homeCombo = this.penaltyService.getHomePenaltyShootoutCombo(listPenaltyShootoutRound);
    const awayCombo = this.penaltyService.getAwayPenaltyShootoutCombo(listPenaltyShootoutRound);
    const list = _.uniqBy(resultDetail, (item) => item.map);
    const maps: GroupMap[] = [];

    _.forEach(list, (item) => {
      const newResultDetail = resultDetail.filter((x) => x.map === item.map);
      if (item.map > 0 && item.map <= 6) {
        _.forEach(newResultDetail, (result) => {
          const penaltyShootoutRound = listPenaltyShootoutRound[item.map - 1];
          this.autoSelectedResultOn1x2AndBothOneNeither(result, penaltyShootoutRound);
          this.autoSelectedResultPenaltyWoodWork(result, penaltyShootoutRound);
          this.renderSettleDetermined(result);
          this.autoFillResultPenaltyShootoutFirstTen(result,
            homeScoreFirstTen, awayScoreFirstTen, homeCombo, awayCombo);
        });
      }

      maps.push(new GroupMap(item.map, newResultDetail));
    });
    maps.forEach(item => item.isHoldResult = item.resultDetail.every(i => i.resultSettingData.isHoldResult));

    return maps;
  }

  private autoSelectedResultPenaltyWoodWork(result: ResultDetail, score: Score) {
    if (_.isEqual(result.betType, BetTypes.PenaltyWoodwork)) {
      if (_.isEmpty(result.homeValue) && result.settlementStatusId === SettlementStatusId.Running) {
        result.homeValue = this.penaltyWoodWorkService.resetResultValue(result.homeValue, score.homeValue);
      }

      if (_.isEmpty(result.awayValue) && result.settlementStatusId === SettlementStatusId.Running) {
        result.awayValue = this.penaltyWoodWorkService.resetResultValue(result.awayValue, score.awayValue);
      }

      result.isInvalidValue = this.penaltyWoodWorkService.isInvalidHomeOrAwayResult(result, score);
    }
  }

  private autoSelectedResultOn1x2AndBothOneNeither(result: ResultDetail, score: Score) {
    if (_.isEmpty(result.homeValue) && result.settlementStatusId === SettlementStatusId.Running) {
      if (_.isEqual(result.betType, BetTypes.PenaltyShootout1X2)) {
        result.homeValue = this.penalty1x2Service.resetValuePenaltyShootout1X2(score);
      } else if (_.isEqual(result.betType, BetTypes.PenaltyShootoutBothOneNeither)) {
        result.homeValue = this.penaltyBothOneNeitherService.resetValuePenalyShootoutBothOneNeither(score);
      }
    } else {
      result.isInvalidValue = _.isEmpty(result.homeValue)
        ? false
        : this.autoFillService.checkConsistentOnBetTypes(result, score);
    }
  }

  private renderSettleDetermined(result: ResultDetail) {

    if (result.settlementStatusId === SettlementStatusId.Running) {
      const isNotTaken = this.penaltyService.isSelectedNotTaken(result.homeValue)
        || this.penaltyService.isSelectedNotTaken(result.awayValue);
      let isBothNotTaken = false;
      if (_.isEqual(result.betType, BetTypes.PenaltyWoodwork)) {
        isBothNotTaken = this.penaltyService.isSelectedNotTaken(result.homeValue)
          && this.penaltyService.isSelectedNotTaken(result.awayValue);
      }

      result.isNotTaken = isNotTaken;
      result.isSettleDetermined = isNotTaken && !isBothNotTaken && _.includes(CheckedSettleDetermined, result.betType);
    } else {
      result.isSettleDetermined = result.settlementStatusId === SettlementStatusId.RefundSettleDetermined;
    }
  }

  private autoFillResultPenaltyShootoutFirstTen(
    result: ResultDetail,
    homeScoreFirstTen: string,
    awayScoreFirstTen: string,
    homeCombo: string,
    awayCombo: string) {
    if (result.settlementStatusId === SettlementStatusId.Running) {
      this.autoFillService.resetValueOnFirstTen(result, homeScoreFirstTen, awayScoreFirstTen, homeCombo, awayCombo);
    } else {
      this.renderPenaltyShootoutFirstTen(result, homeScoreFirstTen, awayScoreFirstTen, homeCombo, awayCombo);
    }
  }

  private renderPenaltyShootoutFirstTen(
    result: ResultDetail,
    homeScoreFirstTen: string,
    awayScoreFirstTen: string,
    homeCombo: string,
    awayCombo: string) {
    const homeValue = this.penaltyService.getScoreValue(result.homeValue);
    if (_.isEqual(result.betType, BetTypes.PenaltyShootoutHomeScore)) {
      result.isInvalidValue = !this.isMatched(homeScoreFirstTen, homeValue);
    } else if (_.isEqual(result.betType, BetTypes.PenaltyShootoutAwayScore)) {
      result.isInvalidValue = !this.isMatched(awayScoreFirstTen, homeValue);
    } else if (_.isEqual(result.betType, BetTypes.PenaltyShootoutExactTotalGoals) 
    || _.isEqual(result.betType, BetTypes.PenaltyShootoutOddEven)) {
      result.isInvalidValue = !this.isMatchedHomeAwayOnPenaltyFirstTen(homeScoreFirstTen,
        awayScoreFirstTen, result);
    } else if (_.isEqual(result.betType, BetTypes.PenaltyShootoutCombo)) {
      result.isInvalidValue = !this.isMatchedHomeAwayOnPenaltyFirstTen(homeCombo,
        awayCombo, result);
    }
  }

  private isMatchedHomeAwayOnPenaltyFirstTen(mainHome: string, mainAway: string, selectedItem: ResultDetail) {
    return _.isEmpty(selectedItem.homeValue) && _.isEmpty(selectedItem.awayValue)
      || (_.isEqual(selectedItem.homeValue, mainHome) && _.isEqual(selectedItem.awayValue, mainAway));
  }

  private isMatched(mainValue: string, firstTenValue: string) {
    return _.isEmpty(firstTenValue) || _.isEqual(mainValue, firstTenValue);
  }
}