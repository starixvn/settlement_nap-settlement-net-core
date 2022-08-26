export class LeagueFilterRequest {
    public fromDate: string;
    public toDate: string;
    public sportTypes: string;
    constructor(formDate: string,
                toDate: string,
                sportTypes: string,
    ) {
        this.fromDate = formDate;
        this.toDate = toDate;
        this.sportTypes = sportTypes;
    }
}
