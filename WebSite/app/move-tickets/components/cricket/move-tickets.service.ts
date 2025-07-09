import { Injectable } from '@angular/core';
import { HttpRequestService, DialogBoxService } from "../../../shared/services";
import { Observable, firstValueFrom } from 'rxjs';
import {
  FilterRequest,
  MultiSport,
  DateFilter,
  MoveTicketsRequest,
  ChildMatch,
} from '../../models';
import * as _ from 'lodash';
import { Result, DialogDataIframe } from '../../../shared/models';
import { Language } from '../../../shared/language.native';

@Injectable()

export class MoveTicketsService {

  constructor(private readonly httpRequestService: HttpRequestService,
    private readonly dialogBoxService: DialogBoxService) { }

  public getLeague(request: object) {
    return this.httpRequestService.postJson(request, `/api/multi-sports/getLeague`, false);
  }

  public getDate(): Observable<DateFilter> {
    const url = `/api/multi-sports/get-date`;
    return this.httpRequestService.getJson(url);
  }

  public filter(request: FilterRequest): Observable<MultiSport> {
    return this.httpRequestService.postJson(request, `/api/moveticket/get-match`);
  }

  public moveTickets(request: MoveTicketsRequest): Observable<Result> {
    return this.httpRequestService.postJson(request, `/api/moveticket/move-ticket`);
  }

  public updateAutoMoveTicketsStatus(isAutoMoveTicketsEnabled: boolean) {
    const query = { isAutoMoveTicketsEnabled : !isAutoMoveTicketsEnabled };
    const request = this.httpRequestService.postJson<boolean>(query, `/api/moveticket/update-auto-move-status`);
    return firstValueFrom(request);
  }

  public getAutoMoveTicketsStatus() {
    const request = this.httpRequestService.getJson<boolean>(`/api/moveticket/get-auto-move-status`);
    return firstValueFrom(request);
  }

  public popupLog(matchId: string, fromDate: string, toData: string ) {
    const src = `/home/log?matchCode=${matchId}&fromDate=${fromDate}&toDate=${toData}&isShowMenu=false&productType=ALL`;
    const frameSrc = encodeURI(src);
    const dialogData = new DialogDataIframe(Language.SettlementLog, frameSrc);
    this.dialogBoxService.popup(dialogData, '1011px', '800px');
  }
}