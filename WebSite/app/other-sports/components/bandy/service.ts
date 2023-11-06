import { Injectable } from "@angular/core";

import { ResultStatusId, SettlementStatusId, SportType } from '../../../shared/constants';
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';

@Injectable()
export class BandyService {
  constructor(private readonly intervalBackgroundPipe: IntervalBackgroundPipe) {
   
  }

  public getIntervalBackground(settlementStatusId: number) {
    return this.intervalBackgroundPipe.transform(settlementStatusId);
  }
}