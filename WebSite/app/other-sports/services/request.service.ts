import { Injectable } from '@angular/core';
import { OtherSportsMatch } from '../models';
import { firstValueFrom } from 'rxjs';
import { MarkedTicketsModel, Result } from '../../shared/models';
import { HttpRequestService } from '../../shared/services';
@Injectable()
export class RequestService {
    apiUrl = 'api/othersports';

    constructor(private readonly httpRequestService: HttpRequestService) {
    }

    public getMatch(query: object) {
        const request = this.httpRequestService.postJson<OtherSportsMatch>(query, `${this.apiUrl}/get-match`);
        return firstValueFrom(request);
    }

    public sendRequest(query: object) {
        const request =  this.httpRequestService.postJson<Result>(query, `${this.apiUrl}/calculate`);
        return firstValueFrom(request);
    }

    public checkMarkedTickets(query: object) {
        const request = this.httpRequestService.postJson<MarkedTicketsModel>(query, `${this.apiUrl}/check-marked-tickets`, false);
        return firstValueFrom(request);
    }

    public getLastestResult(query: object) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/get-latest-result`, false);
    }
}