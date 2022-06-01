import { MultipleSelect } from "../multiple-select.model";
import { GeneralResultDetail } from "../general-result-detail.model";

export class ExternalResultDetail extends GeneralResultDetail {
    constructor(sourceId: number, resourceId: string, sourceName: string, remark = '', homeValue = '', awayValue = '') {
        super();
        this.sourceId = sourceId;
        this.resourceId = resourceId;
        this.sourceName = sourceName;
        this.remark = remark;
        this.homeValue = homeValue;
        this.awayValue = awayValue;
        this.homeName = "-";
        this.awayName = "-";
    }

    public providerExternalId: number;
    public matchId: number;
    public sourceName: string;
    public sourceId: number;
    public homeName = '';
    public awayName = '';
    public otherInfo: string;
    public createDate: string;
    public remark: string;
    public map: number;
    public fromResultDetail = false;
    public multipleResultSelect: MultipleSelect;
}