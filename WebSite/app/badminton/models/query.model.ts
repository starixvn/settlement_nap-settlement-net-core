import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { BadmintonApiKeys } from '../constants';

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
    sportType: number;
    isHedgeMatch: boolean;

    constructor(
        matchId: number,
        selectedResources: ResultDetail[],
        actionName: string,
        isReSettledTickets: boolean,
        sportType: number,
        isDirectly = false) {
        this.matchId = matchId;
        this.selectedResources = selectedResources;
        this.actionName = actionName;
        this.apikey = BadmintonApiKeys.Settle;
        this.isReSettledTickets = isReSettledTickets;
        this.sportType = sportType;
        this.isDirectly = isDirectly;
    }
}

export class MatchQuery {
    matchId: string;
    settleType: string;
    apikey: string;
    sportType: number;
    constructor(matchId: string, settleType: string, apikey: string) {
        this.matchId = matchId;
        this.settleType = settleType;
        this.apikey = apikey;
    }
}