import { ExternalResultDetail } from "./external-result-detail.model";

export class ExternalResult {
    public sourceId: number;
    public sourceName: string;
    public resultDetails: ExternalResultDetail[];
    public remark: string;

    constructor(sourceId: number, resultDetails: ExternalResultDetail[]) {
        this.sourceId = sourceId;
        this.resultDetails = resultDetails;
    }
}