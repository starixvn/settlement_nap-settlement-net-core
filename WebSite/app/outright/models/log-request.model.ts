export interface LogRequest {
    leagueId: number;
    matchCode: string;
    matchId?: number;
    fromDate: string;
    toDate: string;
    balanceUpDay?: string;
    isSubmit?: boolean
}