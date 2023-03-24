export interface FilterRequest {
    fromDate: string;
    toDate: string;
    leagueIds: string;
    statusId: number;
}


export interface SportLeagueRequest {
    fromDate: string,
    toDate: string,
}

export interface InitFilter {
    fromDate: string;
    toDate: string;
    moveBetsDay: string;
}