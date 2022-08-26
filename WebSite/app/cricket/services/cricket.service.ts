import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { HttpRequestService } from '../../shared/services';
import { NetPositionQuery } from '../models';
import { CalculateAction } from '../../shared/constants';
import { ResultNameByIdPipe } from '../pipes';
import { MatchDetail } from '../../shared/models/sportsbook-sop';
@Injectable()
export class CricketService {
    public rootUrl: string;
    constructor(private readonly httpRequestService: HttpRequestService,
        private readonly resultNameByIdPipe: ResultNameByIdPipe) {
    }

    public netPosition(query: NetPositionQuery) {
        let netPositionApi = `${this.rootUrl}/settlement/net-position/calculate`;
        if (_.isEqual(query.action, CalculateAction.unCalculate)) {
            netPositionApi = `${this.rootUrl}/settlement/net-position/uncalculate`;
        }

        return this.httpRequestService.postJson(query, netPositionApi, false);
    }

    public resultNameById(resourceId: string, matchDetail: MatchDetail){
        return this.resultNameByIdPipe.transform(resourceId, matchDetail);
    }
}