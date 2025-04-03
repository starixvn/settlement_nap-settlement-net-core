export interface IUpdateSettlementResultHistoryStatus {
    matchId: number;
    sessionIds: string;
    sportType: number;
    IsOrg: boolean;
}

export class UpdateSettlementResultHistoryStatus implements IUpdateSettlementResultHistoryStatus {
    matchId: number;
    sessionIds: string;
    sportType: number;
    IsOrg: boolean;
    
    constructor(matchId: number, sessionIds: string, sportType: number, IsOrg: boolean) {
        this.matchId = matchId;
        this.sessionIds = sessionIds;
        this.sportType = sportType;
        this.IsOrg = IsOrg;
    }
}