export class Selection {
    public selectionType: number;
    public selectionName: string;
    public ticketStatus: string;
    public result: string;
    public isDifferentResult: boolean;
    public resultStatusId: number;
    public checked: boolean;
    public isResultWarning: boolean;

    constructor(selectionName: string) {
        this.selectionName = selectionName;
    }
}