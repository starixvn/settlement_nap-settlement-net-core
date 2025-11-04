import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { PlayerBetTypes } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { MixCoreService } from './mix-core.service';
import { MixDoubleDoubleCalculateService } from './mix-double-double-calculate.service';
@Injectable()
export class MixDoubleDoubleService {
  readonly targetBetTypes = [PlayerBetTypes.points, PlayerBetTypes.assists, PlayerBetTypes.rebounds, PlayerBetTypes.steals, PlayerBetTypes.blocks];
  readonly #mixDoubleDoubleCalculateService = inject(MixDoubleDoubleCalculateService);
  readonly #mixCoreService = inject(MixCoreService);

  autoFillMixDoubleDouble(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
     if (!this.targetBetTypes.includes(changedResultDetail.betType)) {
      return;
    }

    const doubleDoubleResult = this.#mixCoreService.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.doubleDouble);
    if (doubleDoubleResult) {
      this.#mixDoubleDoubleCalculateService.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);
    }

    const tripleDoubleResult = this.#mixCoreService.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.tripleDouble);
    if (tripleDoubleResult) {
      this.#mixDoubleDoubleCalculateService.calculateTripleDoubleValue(resultDetails, tripleDoubleResult);
    }
  }
}