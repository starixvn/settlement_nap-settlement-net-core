import { Injectable } from "@angular/core";
import { RequestBaseService } from "../../../services/request-base.service";
import { Result } from "../../../../shared/models";
import { firstValueFrom } from "rxjs";
import { RefundQuery } from "../../refund/model/query.model";
import { MatchMoveBet } from "../models/match.model";

@Injectable({
  providedIn: 'root'
})
export class RequestService extends RequestBaseService {
  public checkNewStatus(matchId: number, actionName: string, isSettleAbandonedMatchIBC: boolean) {
    const query = {
      matchId,
      actionName,
      isSettleAbandonedMatchIBC
    };

    const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/check-status`);
    return firstValueFrom(request);
  }

  public refundMatch(query: RefundQuery) {
    const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/refund`);
    return firstValueFrom(request);
  }

  public getSpecificBetType(type: string, action: string) {
    const query = {
      type,
      action
    };
    return this.httpRequestService.postJson(query, `${this.soccerApi}/specific-bet-type`);
  }

  public refundRunningThirdPartyTickets(matchId: number, actionName: string): Promise<Result> {
    const query = {
      matchId,
      actionName
    };
    const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/refund-running-third-party-ticket`);
    return firstValueFrom(request);
  }

  public getMatchDetailThirdPartyBetTickets(matchId: number) {
    const query = {
      matchId
    };

    return this.httpRequestService.postJson(query, `${this.soccerApi}/third-party-bet-tickets-checking`);
  }

  public moveBetType(matchId: number, newMatchId: number, newMatchCode: string, actionName: string) {
    const query = {
      matchId,
      newMatchId,
      newMatchCode,
      actionName
    };

    const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/move-third-party-bet-ticket`);
    return firstValueFrom(request);
  }
}