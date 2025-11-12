import { Injectable, inject } from '@angular/core';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import * as _ from 'lodash';
import { PlayerBetTypes, PlayerTypes } from '../constants';
import { SettlementStatusId } from '../../shared/constants';
import { MixMultiStatsCalculateService } from './mix-multi-stats-calculate.service';
import { MixDoubleDoubleCalculateService } from './mix-double-double-calculate.service';
import { MixHeadHeadCalculateService } from './mix-head-head.service.calculate';
import { MixPerformanceCalculateService } from './performance-calculate/mix-performance-calculate.service';

@Injectable()
export class AutoFillPlayerService {
   targetBetTypes = [
          PlayerBetTypes.stealsBlocks,
          PlayerBetTypes.reboundsAssists,
          PlayerBetTypes.reboundsPoints,
          PlayerBetTypes.reboundsAssistsPoints,
          PlayerBetTypes.doubleDouble,
          PlayerBetTypes.tripleDouble,
          PlayerBetTypes.mostPoints,
          PlayerBetTypes.mostRebounds,
          PlayerBetTypes.mostAssists,
          PlayerBetTypes.mostSteals,
          PlayerBetTypes.mostPointShotsScored,
          PlayerBetTypes.performance,
          PlayerBetTypes.performanceDouble,
          PlayerBetTypes.performanceTriple
      ];

    readonly #mixMultiStatsCalculateService = inject(MixMultiStatsCalculateService);
    readonly #mixDoubleDoubleCalculateService = inject(MixDoubleDoubleCalculateService);
    readonly #mixHeadHeadCalculateService = inject(MixHeadHeadCalculateService);
    readonly #mixPerformanceCalculateService = inject(MixPerformanceCalculateService);

  autoFillPlayerName(resultDetails: ResultDetail[]) {   
      const filteredResults = resultDetails.filter(resultDetail => {
          return this.targetBetTypes.includes(resultDetail.betType) && 
                 resultDetail.settlementStatusId === SettlementStatusId.Running;
      });

      _.forEach(filteredResults, (resultDetail) => {
        this.calculateMultiStats(resultDetails, resultDetail);
        this.calculateDoubleTripleDouble(resultDetails, resultDetail);
        this.calculateHeadToHead(resultDetails, resultDetail);
        this.calculatePerformance(resultDetails, resultDetail);
      });
  }

  private calculateMultiStats(resultDetails: ResultDetail[], resultDetail: ResultDetail): void {
    if(resultDetail.betType === PlayerBetTypes.reboundsAssistsPoints) { 
      this.#mixMultiStatsCalculateService.calculateReboundsAssistsPointsValue(resultDetails, resultDetail);
    } else if(resultDetail.betType === PlayerBetTypes.reboundsAssists) {
      this.#mixMultiStatsCalculateService.calculateReboundsAssistsValue(resultDetails, resultDetail);
    } else if(resultDetail.betType === PlayerBetTypes.reboundsPoints) {
      this.#mixMultiStatsCalculateService.calculateReboundsPointsValue(resultDetails, resultDetail);
    } else if(resultDetail.betType === PlayerBetTypes.stealsBlocks) {
      this.#mixMultiStatsCalculateService.calculateStealsBlocksValue(resultDetails, resultDetail);
    }
  }

  private calculateDoubleTripleDouble(resultDetails: ResultDetail[], resultDetail: ResultDetail): void {
    if(resultDetail.betType === PlayerBetTypes.doubleDouble) {
      this.#mixDoubleDoubleCalculateService.calculateDoubleDoubleValue(resultDetails, resultDetail);
    } else if(resultDetail.betType === PlayerBetTypes.tripleDouble) {
      this.#mixDoubleDoubleCalculateService.calculateTripleDoubleValue(resultDetails, resultDetail);
    }
  }

  private calculateHeadToHead(resultDetails: ResultDetail[], resultDetail: ResultDetail): void {
    if(PlayerTypes.headToHead.includes(resultDetail.betType)){
      this.#mixHeadHeadCalculateService.calculateMixHeadHeadValue(resultDetails, resultDetail);
    }
  }

  private calculatePerformance(resultDetails: ResultDetail[], resultDetail: ResultDetail): void {
    if(PlayerTypes.performance.includes(resultDetail.betType)){
      this.#mixPerformanceCalculateService.autoFillMixPerformance(resultDetails, resultDetail);
    }
  }
}