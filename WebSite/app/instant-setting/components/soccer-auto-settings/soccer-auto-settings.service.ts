import { inject, Injectable } from "@angular/core";
import { HttpRequestService } from "../../../shared/services";
import { firstValueFrom } from "rxjs";
import { Result } from "../../../shared/models";
import { AutoSettleSettingRequest } from "../../../shared/models/settings";

interface ISoccerAutoSettingsService {
  updateSettings(command: any) : Promise<Result>;
}

@Injectable()
export class SoccerAutoSettingsService implements ISoccerAutoSettingsService {
  private readonly  baseUrl = "/api/soccer-setting";
  private  readonly httpRequestService = inject(HttpRequestService);


  public updateSettings(command: AutoSettleSettingRequest) : Promise<Result> {
    const request = this.httpRequestService.postJson<Result>(command, `${this.baseUrl}/update-settings`);
    
    return firstValueFrom(request);
  }
}