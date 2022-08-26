export interface FilterRequest {
    fromDate: string;
    toDate: string;
    ticketStatus: string;
    matchStatus: string;
    holdStatus: string;
    matchCode: string;
    leagueIds: string;
    sportTypes: string;
    isIncludeTest: boolean;
}
