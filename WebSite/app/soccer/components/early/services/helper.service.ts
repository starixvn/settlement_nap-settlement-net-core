import { Injectable } from "@angular/core";
import { firstValueFrom } from 'rxjs';
import { ResultDetail, SettleQuery } from "../../../models";
import { ClosePopupService, HttpRequestService } from "../../../../shared/services";
import { GroupBetTypeService } from "./group-bettpe.service";
import { SportType } from '../../../../shared/constants';
@Injectable()
export class HelperService {
    private soccerApi = '/api/soccer';
    private aioApi = '/api/aio';
    constructor(
        private readonly httpRequestService: HttpRequestService,
        private readonly closePopupService: ClosePopupService,
        private readonly groupBetTypeService: GroupBetTypeService,
    ) { }

    public settle(query: SettleQuery) {
        return this.httpRequestService.postJson(query, `${this.soccerApi}/settle-early`);
    }

    public getMatch(matchId: number) {
        const request =  this.httpRequestService.postJson({ matchId  }, `${this.soccerApi}/get-match-early`);
        return firstValueFrom(request);
    }

    public getGroupBetType(resultDetails: ResultDetail[]) {
        return this.groupBetTypeService.getGroupBetType(resultDetails);
    }

    public closePopup() {
        return this.closePopupService.closePopup();
    }

    public getLastestMatchResult(matchId: number) {
        const query = {
            matchId,
            sportType: SportType.soccer,
        };

        return this.httpRequestService.postJson(query, `${this.aioApi}/get-recal-result`);
    }

    public checkMarkedTickets(matchId: number, selectedResources: ResultDetail[])  {
        const query = {
            matchId,
            selectedResources
        };
        return this.httpRequestService.postJson(query, `${this.aioApi}/check-marked-tickets`, false);
    }

    public checkingStatus(matchId: number, actionName: string) {
        const query = {
            matchId,
            actionName,
            isSettleDetermined: false,
            isEarly: true
        };
        return this.httpRequestService.postJson(query, `${this.soccerApi}/check-status`, false);
    }
}