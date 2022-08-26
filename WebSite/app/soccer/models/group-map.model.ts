import { ResultDetail } from './index';

export class GroupMap {
    public id: number;
    public collapsed: boolean;
    public checked: boolean;
    public resultDetail: ResultDetail[];
    public isHoldResult: boolean;

    constructor(id: number, resultDetail: ResultDetail[]) {
        this.id = id;
        this.collapsed = false;
        this.checked = false;
        this.resultDetail = resultDetail;
        this.isHoldResult = false;
    }
}