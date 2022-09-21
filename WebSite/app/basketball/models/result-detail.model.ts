import { GeneralResultDetail, ResultSettingModel } from "../../shared/models";

export class ResultDetail extends GeneralResultDetail {
    public ticketStatus: string;
    public betType: string;
    public betTypeName: string;
    public checked: boolean;
    public isResultWarning: boolean;
    public originalHomeValue = '';
    public originalAwayValue = '';
    public className: string;
    public resultSettingData: ResultSettingModel;
    constructor(resourceId: string, homeValue: string, awayValue: string, checked: boolean) {
        super();
        this.resourceId = resourceId;
        this.homeValue = homeValue;
        this.awayValue = awayValue;
        this.checked = checked;
    }
}