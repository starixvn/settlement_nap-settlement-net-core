import { Injectable } from '@angular/core';
import { HttpRequestService } from '../../shared/services';
@Injectable()
export class RequestService {
    apiUrl = 'api/othersports';

    constructor(private readonly httpRequestService: HttpRequestService) {
    }

    public getMatch(query: object) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/get-match`);
    }

    public calculate(query: object) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/calculate`);
    }

    public refund(query: object) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/refund`);
    }

    public refundParlay(query: object) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/refund-parlay`);
    }

    public checkMarkedTickets(query: object) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/check-marked-tickets`, false);
    }

    public getLastestResult(query: object) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/get-lastest-result`, false);
    }
}