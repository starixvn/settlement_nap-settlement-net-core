import { Injectable } from "@angular/core";
import { CalculateAction } from '../../../shared/constants';
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';
import { ResultDetail } from "../../../shared/models/sportsbook-sop/result-detail.model";
import { SettleQuery } from "../../models";
import { AioService } from "../../../shared/services";

type SettleRequestParams = {
  type: string,
  matchDetail,
  resultDetais: ResultDetail[],
  isReSettledTickets: boolean,
  isScoreDirect: boolean,
  isLeader: boolean,
  refResultStatus: any,
  betStatus: string

}  

@Injectable()
export class BandyService {
  constructor(
    private readonly intervalBackgroundPipe: IntervalBackgroundPipe,
    private readonly aioService: AioService) {}

  public getIntervalBackground(settlementStatusId: number) {
    return this.intervalBackgroundPipe.transform(settlementStatusId);
  }

  public async sendSettleRequest({
    type,
    matchDetail,
    resultDetais,
    isReSettledTickets,
    isScoreDirect,
    isLeader = false, 
    refResultStatus = null,
    betStatus = ''}: SettleRequestParams) {
    
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
      betStatus
    );
    settleQuery.refResultStatus = refResultStatus;
    settleQuery.isLeader = isLeader;
    settleQuery.apikey = 'bandy'

    const result = await this.aioService.push(settleQuery);

    return result
  }
}