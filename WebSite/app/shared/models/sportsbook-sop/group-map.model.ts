import { ResultDetail } from './result-detail.model';

export class GroupMap {
    public collapsed: boolean;
    public checked: boolean;
    public resultDetail: ResultDetail[];
    public isHoldResult: boolean;
    public groupName: string;
    public teamName: string;
    public icon: string;

    constructor(groupName: string, resultDetail: ResultDetail[]) {
        this.groupName = groupName;
        this.collapsed = false;
        this.checked = false;
        this.resultDetail = resultDetail;
    }
}