import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { Resources, PlayerBetTypes } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { MixCoreService } from './mix-core.service';
import { MixMultiStatsCalculateService } from './mix-multi-stats-calculate.service';
@Injectable()
export class MixMultiStatsService {
  readonly #mixMultiStatsCalculateService = inject(MixMultiStatsCalculateService);
  readonly #mixCoreService = inject(MixCoreService);

  autoFillMixReboundsAssists(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    this.handleReboundsAssistsMix(resultDetails, changedResultDetail);
    this.handleReboundsPointsMix(resultDetails, changedResultDetail);
    this.handleReboundsAssistsPointsMix(resultDetails, changedResultDetail);
    this.handleStealsBlocksMix(resultDetails, changedResultDetail);
  }

  private handleReboundsAssistsMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixReboundsAssists.includes(changedResultDetail.betType)) {
      return;
    }

    const reboundsAssistsResult = this.#mixCoreService.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.reboundsAssists);
    if (reboundsAssistsResult) {
      this.#mixMultiStatsCalculateService.calculateReboundsAssistsValue(resultDetails, reboundsAssistsResult);
    }
  }

  private handleReboundsPointsMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixReboundsPoints.includes(changedResultDetail.betType)) {
      return;
    }

    const reboundsPointsResult = this.#mixCoreService.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.reboundsPoints);
    if (reboundsPointsResult) {
      this.#mixMultiStatsCalculateService.calculateReboundsPointsValue(resultDetails, reboundsPointsResult);
    }
  }

  private handleReboundsAssistsPointsMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixReboundsAssistsPoints.includes(changedResultDetail.betType)) {
      return;
    }

    const reboundsAssistsPointsResult = this.#mixCoreService.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.reboundsAssistsPoints);
    if (reboundsAssistsPointsResult) {
      this.#mixMultiStatsCalculateService.calculateReboundsAssistsPointsValue(resultDetails, reboundsAssistsPointsResult);
    }
  }

  private handleStealsBlocksMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixStealsBlocks.includes(changedResultDetail.betType)) {
      return;
    }

    const stealsBlocksResult = this.#mixCoreService.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.stealsBlocks);
    if (stealsBlocksResult) {
      this.#mixMultiStatsCalculateService.calculateStealsBlocksValue(resultDetails, stealsBlocksResult);
    }
  }
}