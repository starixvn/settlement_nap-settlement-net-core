export interface FilterRequest {
    fromDate: string;
    toDate: string;
    matchStatus: string;
    holdStatus: string;
    overStatus: string;
    matchCode: string;
    leagueIds: string;
    sportTypes: string;
    isIncludeTest: boolean;
    matchType: string;
    autoPayout: string;
}
