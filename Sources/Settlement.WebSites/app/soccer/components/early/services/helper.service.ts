import { Injectable } from "@angular/core";
import { ResultDetail, SettleQuery } from "../../../models";
import { AioService, ClosePopupService, HttpRequestService } from "../../../../shared/services";
import { ResultSettingQuery } from "../../../../shared/models";
import { GroupBetTypeService } from "./group-bettpe.service";
import { SportType } from '../../../../shared/constants';
@Injectable()
export class HelperService {
    constructor(
        private readonly httpRequestService: HttpRequestService,
        private readonly closePopupService: ClosePopupService,
        private readonly aioService: AioService,
        private readonly groupBetTypeService: GroupBetTypeService,
    ) { }

    public settle(query: SettleQuery) {
        return this.aioService.push(query);
    }

    public getMatch(matchId: number, apikey: string) {
        const matchQuery = {
            matchId,
            apikey,
            settleType: "MNL"
        };

        return this.aioService.getMatch(matchQuery);
    }

    public getGroupBetType(resultDetails: ResultDetail[]) {
        return this.groupBetTypeService.getGroupBetType(resultDetails);
    }

    public closePopup(matchId: number) {
        return this.closePopupService.closePopup(matchId);
    }

    public getLastestMatchResult(matchId: number, apiUrl: string) {
        const query = {
            matchId,
            sportType: SportType.soccer,
        };

        return this.httpRequestService.postJson(query, `${apiUrl}/api/aio/get-recal-result`);
    }

    public changeResultSetting(query: ResultSettingQuery, apiUrl: string) {
        return this.httpRequestService.postJson(query, `${apiUrl}/api/aio/result-setting`);
    }

    public checkMarkedTickets(matchId: number, selectedResources: ResultDetail[], apiUrl: string)  {
        const query = {
            matchId,
            selectedResources,
            isMergedParlay: true,
        };
        return this.httpRequestService.postJson(query, `${apiUrl}/api/aio/check-marked-tickets`, false);
    }

    public checkingStatus(matchId: number, actionName: string, apiUrl: string) {
        const query = {
            matchId,
            actionName,
            isSettleDetermined: false,
            isEarly: true
        };
        return this.httpRequestService.postJson(query, `${apiUrl}/api/soccer/check-status`, false);
    }
}