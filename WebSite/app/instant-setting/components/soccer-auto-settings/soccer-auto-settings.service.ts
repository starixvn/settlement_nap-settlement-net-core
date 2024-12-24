import { inject, Injectable } from "@angular/core";
import { HttpRequestService } from "../../../shared/services";
import { firstValueFrom, from, Observable, of } from "rxjs";
import { UpdateSettleSettings } from "./types";
import { Result } from "../../../shared/models";

interface ISoccerAutoSettingsService {
  updateSettings(command: any) : Promise<Result>;
}

@Injectable()
export class SoccerAutoSettingsService implements ISoccerAutoSettingsService {
  private readonly  baseUrl = "/api/soccer-setting";
  private  readonly httpRequestService = inject(HttpRequestService);


  public updateSettings(command: UpdateSettleSettings) : Promise<Result> {
    const request = this.httpRequestService.postJson<Result>(command, `${this.baseUrl}/update-settings`);
    
    return firstValueFrom(request);
  }
}