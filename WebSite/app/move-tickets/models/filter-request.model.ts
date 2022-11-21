export interface FilterRequest {
    fromDate: string;
    toDate: string;
    matchStatus: string;
    matchCode: string;
    leagueIds: string;
    sportTypes: string;
    isIncludeTest: boolean;
}
