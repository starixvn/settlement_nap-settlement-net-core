export interface OddFlexModel {
    resourceId: string;
    betType: number;
    betChoice: string;
    oddsInfo: string;
    info: OddsInfoModel;
}

export interface OddsInfoModel {
    playerId: number;
    playerName: string;
    teamId: number;
    isHome: boolean;
    statistics: SelectionInfo[];
    results: ResultInfo[];
}

export interface SelectionInfo {
    type: string;
    value: string;
}

export interface ResultInfo {
    type: string;
    value: string;
}
