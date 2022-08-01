import { Injectable } from "@angular/core";
import { ResultDetail, SettleQuery } from "../../../models";
import { ClosePopupService, HttpRequestService } from "../../../../shared/services";
import { ResultSettingQuery } from "../../../../shared/models";
import { GroupBetTypeService } from "./group-bettpe.service";
import { SportType } from '../../../../shared/constants';
@Injectable()
export class HelperService {
    constructor(
        private readonly httpRequestService: HttpRequestService,
        private readonly closePopupService: ClosePopupService,
        private readonly groupBetTypeService: GroupBetTypeService,
    ) { }

    public settle(query: SettleQuery) {
        return this.httpRequestService.postJson(query, `api/soccer/settle-early`);
    }

    public getMatch(matchId: number) {
        return this.httpRequestService.postJson({ matchId  }, `api/soccer/get-match-early`);
    }

    public getGroupBetType(resultDetails: ResultDetail[]) {
        return this.groupBetTypeService.getGroupBetType(resultDetails);
    }

    public closePopup(matchId: number) {
        return this.closePopupService.closePopup(matchId);
    }

    public getLastestMatchResult(matchId: number) {
        const query = {
            matchId,
            sportType: SportType.soccer,
        };

        return this.httpRequestService.postJson(query, `api/aio/get-recal-result`);
    }

    public changeResultSetting(query: ResultSettingQuery) {
        return this.httpRequestService.postJson(query, `api/aio/result-setting`);
    }

    public checkMarkedTickets(matchId: number, selectedResources: ResultDetail[])  {
        const query = {
            matchId,
            selectedResources,
            isMergedParlay: true,
        };
        return this.httpRequestService.postJson(query, `api/aio/check-marked-tickets`, false);
    }

    public checkingStatus(matchId: number, actionName: string) {
        const query = {
            matchId,
            actionName,
            isSettleDetermined: false,
            isEarly: true
        };
        return this.httpRequestService.postJson(query, `api/soccer/check-status`, false);
    }
}