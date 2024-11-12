export interface Provider  {
    sourceId: number;
    sourceName: string;
    priority: number;
    isActive: boolean;
}

export interface ResultSetting {
    settleType: AutoSettleType,
    resourceType: ResourceType,
    enabled: boolean,
    waitingTime: number,
    isTraderRequired:boolean
    minProvider: number,
    providers: Provider[],
}

export interface IAutoSettleSettingsResponse {
    leagueId: number;
    leagueName: string;
    typeObject: "League" | "Match"
    matchId: number | null;
    isApplyAll: boolean;
    resultSettings: ResultSetting[];
}


export class AutoSettleSettings implements IAutoSettleSettingsResponse {
    leagueId = 0;
    leagueName = '';
    matchId: number | null = 0;
    typeObject: "League" | "Match" = "Match";
    isApplyAll = false;
    resultSettings: ResultSetting[] = []
}

export enum AutoSettleType  {
    AutoDirect = 5,
    AutoPayout = 6, // for service ap2
    AutoRefund = 7
}

export enum ResourceType {
    Total,
    Main,
    Early
}

export type GetAutoSettleSettings = {
    leagueId: number;
    matchId : number;
    sportType: number;
    typeObject: "League" | "Match";
}