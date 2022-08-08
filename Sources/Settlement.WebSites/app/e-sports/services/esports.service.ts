import { Injectable } from "@angular/core";
import { MatchDetail } from "../../shared/models/sportsbook-sop";
import { IntervalBackgroundPipe } from "../../shared/pipes/interval-background.pipe";
import { ResourceNameByIdPipe } from "../pipes";
import { ResultByTeamNamePipe } from "../../shared/pipes/result-by-team-name.pipe";

@Injectable()
export class ESportsService {
    constructor(
        private readonly resultByTeamNamePipe: ResultByTeamNamePipe,
        private readonly resourceNameByIdPipe: ResourceNameByIdPipe,
        private readonly intervalBackgroundPipe: IntervalBackgroundPipe) {
    }

    public getIntervalBackground(settlementStatusId: number) {
        return this.intervalBackgroundPipe.transform(settlementStatusId);
    }

    public getResourceNameById(resourceId: string) {
        return this.resourceNameByIdPipe.transform(resourceId);
    }

    public getResultByTeamName(score: string, matchDetail: MatchDetail, groupBetType: number) {
        return this.resultByTeamNamePipe.transform(score, matchDetail, groupBetType);
    }
}