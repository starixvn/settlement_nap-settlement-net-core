export interface OutrightLog {
    orId: number;
    matchCode: string;
    teamId: number;
    leagueId: number;
    leagueName: string;
    collapsed?: boolean;
    outrightDetails: OutrightLogDetail[]
}


export interface OutrightLogDetail {
    logId: number;
    logDate: string;
    username: string;
    actionNameEn: string;
    leagueId: number;
    matchId: number;
    matchCode: string;
    teamId: number;
    eventDate: string;
    result: string;
    remark: string;
    teamName: string;
    leagueName: string;
    remarkName: string;
}