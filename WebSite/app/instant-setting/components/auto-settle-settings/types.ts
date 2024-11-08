export interface Provider  {
    sourceId: number;
    sourceName: string;
    priority: number;
    isActive: boolean;
}

export interface ResultSetting {
    typeSettle: "Payout" | "Refund"
    typeResult: "Main" | "Early",
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
    resultSettings: ResultSetting[];
}


export class AutoSettleSettings implements IAutoSettleSettingsResponse {
    leagueId: number = 0;
    leagueName: string = '';
    matchId: number | null = 0;
    typeObject: "League" | "Match" = "Match";
    resultSettings: ResultSetting[] = []
}