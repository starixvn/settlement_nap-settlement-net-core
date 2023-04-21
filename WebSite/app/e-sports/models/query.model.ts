import { NgStyle } from '@angular/common';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ApiKeys } from '../constants';
export class SettleQuery {
    matchId: number;
    selectedResources: ResultDetail[];
    actionName: string;
    apikey: string;
    isReSettledTickets: boolean;
    isLeader: boolean;
    isDirectly: boolean;
    sportType: number;
    isHedgeMatch: boolean;

    constructor(
        matchId: number,
        selectedResources: ResultDetail[],
        actionName: string,
        isReSettledTickets: boolean,
        isLeader: boolean,
        sportType: number,
        isDirectly = false) {
        this.matchId = matchId;
        this.selectedResources = selectedResources;
        this.actionName = actionName;
        this.apikey = ApiKeys.Settle;
        this.isReSettledTickets = isReSettledTickets;
        this.isLeader = isLeader;
        this.isDirectly = isDirectly;
        this.sportType = sportType;
    }
}

export class MatchQuery {
    matchId: string;
    settleType: string;
    apikey: string;
    constructor(matchId: string, settleType: string, apikey: string) {
        this.matchId = matchId;
        this.settleType = settleType;
        this.apikey = apikey;
    }
}