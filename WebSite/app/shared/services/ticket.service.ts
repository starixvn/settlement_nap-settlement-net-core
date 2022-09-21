import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequestService } from './http-request.service.native';
import { MarkedTicketsModel } from '../models';

@Injectable()
export class TicketService {
  constructor(private readonly httpRequestService: HttpRequestService) { }

  public checkMarkedTickets(param: object): Observable<MarkedTicketsModel> {
    return this.httpRequestService.postJson(param, "api/sportsbook-aio/checking-marked-tickets", false);
  }
}