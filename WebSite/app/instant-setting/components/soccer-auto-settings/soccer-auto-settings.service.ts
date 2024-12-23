import { inject, Injectable } from "@angular/core";
import { HttpRequestService } from "../../../shared/services";
import { from, Observable, of } from "rxjs";

@Injectable()
export class SoccerAutoSettingsService {
  private readonly  baseUrl = "/api/auto-settle-settings";
  private  readonly httpRequestService = inject(HttpRequestService);
  
  public getSettings() : Observable<any> {
    return of([
      {
        settleType: "Auto Payout",
        enabled: true,
        waitingTime: 5,
        applyToUnCalMatch: false,
      },
      {
        settleType: "Direct Payout",
        enabled: false,
        waitingTime: 5,
        applyToUnCalMatch: false,
      },
      {
        settleType: "Auto Refund",
        enabled: true,
        waitingTime: 5,
        applyToUnCalMatch: false,
      },
    ])
  }

  public saveSettings(settings: any) : Observable<any> {
    return of([])
  }
}