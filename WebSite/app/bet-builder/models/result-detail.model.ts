export class ResultDetail {
    public resourceId: string;
    public ticketStatus: string;
    public betType: string;
    public betTypeName: string;
    public homeValue = '';
    public awayValue = '';
    public resultStatusId: number;
    public settlementStatusId: number;
    public resultStatus: string;
    public checked: boolean;
    public isResultWarning: boolean;
    public originalHomeValue = '';
    public originalAwayValue = '';
    constructor(resourceId: string, homeValue: string, awayValue: string, checked: boolean) {
        this.resourceId = resourceId;
        this.homeValue = homeValue;
        this.awayValue = awayValue;
        this.checked = checked;
    }
}