import { ApiKeys } from "../constants";
import { ResultDetail } from "../../shared/models/sportsbook-sop";

export class QueryMatch {
    matchId: number;
    isRefundPage: boolean;
    constructor(matchId: number, isRefundPage: boolean) {
        this.matchId = matchId;
        this.isRefundPage = isRefundPage;
    }
}

export class SettleQuery {
    matchId: number;
    selectedResources: ResultDetail[];
    actionName: string;
    apikey: string;
    isReSettledTickets: boolean;
    isLeader: boolean;
    isDirectly: boolean;
    betStatus: string;
    childMatchIds: string;
    refResultStatus: number;

    constructor(
        matchId: number,
        selectedResources: ResultDetail[],
        actionName: string,
        isReSettledTickets: boolean,
        isDirectly: boolean,
        betStatus: string,
        childMatchIds = "") {
        this.matchId = matchId;
        this.selectedResources = selectedResources;
        this.actionName = actionName;
        this.apikey = ApiKeys.Settle;
        this.isReSettledTickets = isReSettledTickets;
        this.isLeader = false;
        this.isDirectly = isDirectly;
        this.betStatus = betStatus;
        this.childMatchIds = childMatchIds;
    }
}