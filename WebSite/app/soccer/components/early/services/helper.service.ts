import { Injectable } from "@angular/core";
import { firstValueFrom } from 'rxjs';
import { ResultDetail, SettleQuery } from "../../../models";
import { ClosePopupService, HttpRequestService } from "../../../../shared/services";
import { Result } from '../../../../shared/models';
import { GroupBetTypeService } from "./group-bettpe.service";
@Injectable()
export class HelperService {
    private readonly soccerApi = '/api/soccer';
    constructor(
        private readonly httpRequestService: HttpRequestService,
        private readonly closePopupService: ClosePopupService,
        private readonly groupBetTypeService: GroupBetTypeService,
    ) { }

    public settle(query: SettleQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/settle-early`);
        return firstValueFrom(request);
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

    public checkingStatus(matchId: number, actionName: string) {
        const query = {
            matchId,
            actionName,
            isSettleDetermined: false,
            isEarly: true
        };
        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/check-status`, false);
        return firstValueFrom(request);
    }
}