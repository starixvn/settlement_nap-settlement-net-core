export class SportFilterRequest {
    public fromDate: string;
    public toDate: string;
    constructor(formDate: string, toDate: string) {
        this.fromDate = formDate;
        this.toDate = toDate;
    }
}
