import { Injectable } from "@angular/core";
import { firstValueFrom } from 'rxjs';
import { HttpRequestService } from "../../../../shared/services";
import { InstantCalculationQuery, SettleQuery, UncalculateFullTimeQuery } from "../models/query.model";
import { Result } from "../../../../shared/models";
import { Match, MatchDetailSoccer as MatchDetail, TicketGroupCount, UndoChecking } from "../models/match.model";
import { ResultDetail } from "../../../models";
import { ExternalResultDetail, SaveScoreQuery } from "../../../../shared/models/sportsbook-sop";
import { RequestBaseService } from "../../../services/request-base.service";
@Injectable()
export class RequestService extends RequestBaseService {
    
    public checkNewStatus(matchId: number, actionName: string) {
        const query = {
            matchId,
            actionName
        };

        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/check-status`);
        return firstValueFrom(request);
    }

    public getLastestMatchResult(matchId: number) {
        const query = {
            matchId
        };

        const request =  this.httpRequestService.postJson<MatchDetail>(query, `${this.soccerApi}/get-latest-match-detail`);
        return firstValueFrom(request);
    }

    public calculate(query: SettleQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/calculate`);
        return firstValueFrom(request);
    }

    public unCalculateFt(query: UncalculateFullTimeQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/uncalculate-ft`);
        return firstValueFrom(request);
    }

    public undoCheckingScore(matchId: number) {
        const query = {
            matchId,
        };
        const request =  this.httpRequestService.postJson<UndoChecking>(query, `${this.soccerApi}/undo-checking-score`);

        return firstValueFrom(request);
    }

    public pushInstantScore(query: InstantCalculationQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/push-instant-score`);
        return firstValueFrom(request);
    }

    public getResultDetail(matchId: number) {
        const request =  this.httpRequestService.getJson<ResultDetail[]>(`${this.soccerApi}/get-match?=matchId=${matchId}`);
        return firstValueFrom(request);
    }

    saveScore(match: MatchDetail, goalRecord: string, resultDetails: ExternalResultDetail[]): Promise<Result> {
        const query = {
            matchId: match.matchId,
            isEnabledGoalRecordHt: match.isEnabledGoalRecordHt,
            isEnabledGoalRecordFt: match.isEnabledGoalRecordFt,
            resultDetails,
            goalRecord
        };
        const request =  this.httpRequestService.postJson<Result>(query,`${this.soccerApi}/save-score`);
        return firstValueFrom(request);
    }

    saveOutsideScore(query: SaveScoreQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/save-outside-score`);
        return firstValueFrom(request);
    }

    countTickets(matchId: number) {
        const query = {
            matchId
        };
        const request = this.httpRequestService.postJson<TicketGroupCount[]>(query, `${this.soccerApi}/count-group-tickets`);
        return firstValueFrom(request);
    }
}