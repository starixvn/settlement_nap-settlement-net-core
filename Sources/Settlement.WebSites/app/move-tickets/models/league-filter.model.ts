export class LeagueFilterRequest {
    public fromDate: string;
    public toDate: string;
    public sportTypes: string;
    public page = 1;
    constructor(formDate: string,
                toDate: string,
                sportTypes: string,
    ) {
        this.fromDate = formDate;
        this.toDate = toDate;
        this.sportTypes = sportTypes;
    }
}
