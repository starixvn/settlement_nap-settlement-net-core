import { ResultDetail } from '../../shared/models/sportsbook-sop/result-detail.model';
import { SportType } from '../../shared/constants';
import { ResultCommand } from '../../shared/models/result.model';
export class SettleQuery {
    matchId: number;
    selectedResources: ResultDetail[];
    actionName: string;
    isReSettledTickets: boolean;
    sportType: number;
    isLeader: boolean;
    isHedgeMatch: boolean;

    constructor(
        matchId: number,
        selectedResources: ResultDetail[],
        actionName: string,
        isReSettledTickets: boolean,
        isLeader: boolean,
        isHedgeMatch: boolean) {
        this.matchId = matchId;
        this.selectedResources = selectedResources;
        this.actionName = actionName;
        this.isReSettledTickets = isReSettledTickets;
        this.sportType = SportType.cricket;
        this.isLeader = isLeader;
        this.isHedgeMatch = isHedgeMatch;
    }
}

export class MatchQuery {
    matchId: number;
    settleType: string;
    sportType: number;
    constructor(matchId: number, settleType: string, sportType: number) {
        this.matchId = matchId;
        this.settleType = settleType;
        this.sportType = sportType;
    }
}

export class SettleChildMatchQuery {
    childMatchIds: string;
    selectedResources: ResultDetail[];
    actionName: string;
    isReSettledTickets: boolean;

    constructor(
        childMatchIds: string,
        selectedResources: ResultDetail[],
        actionName: string,
        isReSettledTickets: boolean) {
        this.childMatchIds = childMatchIds;
        this.selectedResources = selectedResources;
        this.actionName = actionName;
        this.isReSettledTickets = isReSettledTickets;
    }
}