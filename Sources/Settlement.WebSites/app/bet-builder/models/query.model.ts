import { Selection } from './selection.model';
export class GetMatchesQuery {
    matchCode: string;
    status: string;
    leagueIds: string;
    sportTypes: string;
    fromDate: string;
    toDate: string;

    constructor(
        matchCode: string,
        status: string,
        leagueId: string,
        sportType: string,
        fromDate: string,
        toDate: string) {
        this.matchCode = matchCode;
        this.status = status;
        this.leagueIds = leagueId;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.sportTypes = sportType;
    }
}

export class SettleQuery {
    matchId: number;
    resources: Selection[];
    actionName: string;

    constructor(matchId: number, resources: Selection[], actionName: string) {
        this.matchId = matchId;
        this.resources = resources;
        this.actionName = actionName;
    }
}