import { Injectable } from '@angular/core';
import { HttpRequestService } from '../../shared/services';
import { Observable } from 'rxjs';
import { LogQuery } from '../models';

@Injectable()
export class SearchService {
    private readonly httpRequestService: HttpRequestService;

    constructor(httpRequestService: HttpRequestService) {
        this.httpRequestService = httpRequestService;
    }

    public filter(apiUrl: string): Observable<LogQuery> {
        const url = `${apiUrl}/api/log/filter`;
        return this.httpRequestService.getJson(url);
    }

    public search(query: LogQuery) {
        return this.httpRequestService.postJson(query, `${ query.apiUrl}/api/log/getLog`);
    }
}