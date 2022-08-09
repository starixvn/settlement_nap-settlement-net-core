import { ResultDetail } from '../../shared/models/sportsbook-sop/result-detail.model';
import { CalculateAction, SportType } from '../../shared/constants';
export class SettleQuery {
    matchId: number;
    selectedResources: ResultDetail[];
    actionName: string;
    isReSettledTickets: boolean;
    sportType: number;
    isLeader: boolean;

    constructor(
        matchId: number,
        selectedResources: ResultDetail[],
        actionName: string,
        isReSettledTickets: boolean,
        isLeader: boolean) {
        this.matchId = matchId;
        this.selectedResources = selectedResources;
        this.actionName = actionName;
        this.isReSettledTickets = isReSettledTickets;
        this.sportType = SportType.cricket;
        this.isLeader = isLeader;
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

export class NetPositionQuery {
    matchId: number;
    action: string;
    isApplyHedging: boolean;
    serviceCommand: string;
    constructor(matchId: number, action: string, isApplyHedging: boolean, serviceCommand: string) {
        this.matchId = matchId;
        this.action = action;
        this.isApplyHedging = isApplyHedging;
        this.serviceCommand = serviceCommand;
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