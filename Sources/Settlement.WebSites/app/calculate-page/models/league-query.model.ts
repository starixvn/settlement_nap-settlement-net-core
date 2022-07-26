export class LeagueQuery {
    showAll = true;
    fromDate: string;
    toDate: string;

    constructor(fromDate: string, toDate: string) {
        this.fromDate = fromDate;
        this.toDate = toDate;
    }
}