import { Injectable } from "@angular/core";

import { CalculateAction, ResultStatusId, SettlementStatusId, SportType } from '../../../shared/constants';
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';
import { ResultDetail } from "../../../shared/models/sportsbook-sop/result-detail.model";
import { SettleQuery } from "../../models";
import { AioService } from "../../../shared/services";

@Injectable()
export class BandyService {
  constructor(private readonly intervalBackgroundPipe: IntervalBackgroundPipe,   private readonly aioService: AioService,
    ) {
   
  }

  public getIntervalBackground(settlementStatusId: number) {
    return this.intervalBackgroundPipe.transform(settlementStatusId);
  }

  public async sendSettleRequest(type: string,
    matchDetail,
    resultDetais: ResultDetail[],
    isReSettledTickets: boolean,
    isScoreDirect: boolean,
    isLeader = false, 
    refResultStatus = null) {
    
    if (type === CalculateAction.unCalculate) {
      resultDetais.forEach((item) => {
        item.homeValue = "";
        item.awayValue = "";
      });
    }

    const settleQuery = new SettleQuery(
      matchDetail,
      resultDetais,
      type,
      isReSettledTickets,
      isScoreDirect,
      ""
    );
    settleQuery.refResultStatus = refResultStatus;
    settleQuery.isLeader = isLeader;

    const result = await this.aioService.push(settleQuery);

    return result
  }
}