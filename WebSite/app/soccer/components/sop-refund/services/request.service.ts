import { Injectable } from "@angular/core";
import { RequestBaseService } from "../../../services/request-base.service";
import { Result } from "../../../../shared/models";
import { firstValueFrom } from "rxjs";
import { RefundQuery } from "../../refund/model/query.model";

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
}