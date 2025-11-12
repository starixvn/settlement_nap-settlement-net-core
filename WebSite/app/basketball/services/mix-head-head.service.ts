import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { PlayerBetTypes, PlayerTypes } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { MixCoreService } from './mix-core.service';
import { MixHeadHeadCalculateService } from './mix-head-head.service.calculate';

@Injectable()
export class MixHeadHeadService {
  readonly #mixCoreService = inject(MixCoreService);
  readonly #mixHeadHeadCalculateService = inject(MixHeadHeadCalculateService);

  autoFillMixHeadHead(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!PlayerTypes.baseStats.includes(changedResultDetail.betType)) {
      return;
    }
    
    this.processMixHeadHeadComparison(resultDetails, changedResultDetail);
  }

  private processMixHeadHeadComparison(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    const betType = changedResultDetail.betType;
    
    const mixResultMapping = {
      [PlayerBetTypes.points]: PlayerBetTypes.mostPoints,
      [PlayerBetTypes.rebounds]: PlayerBetTypes.mostRebounds,
      [PlayerBetTypes.assists]: PlayerBetTypes.mostAssists,
      [PlayerBetTypes.steals]: PlayerBetTypes.mostSteals,
      [PlayerBetTypes.shotsScored]: PlayerBetTypes.mostPointShotsScored
    };

    const mixResultType = mixResultMapping[betType];
    if (mixResultType) {
      const mixResult = this.#mixCoreService.filterMixResultByBetType(resultDetails, changedResultDetail.resourceId, mixResultType);
      _.forEach(mixResult, x => {
        this.#mixHeadHeadCalculateService.calculateMixHeadHeadValue(resultDetails, x);
      });
    }
  }

  
}