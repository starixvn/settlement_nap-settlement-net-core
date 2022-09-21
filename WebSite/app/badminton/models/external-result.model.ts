import { ExternalResultDetail } from ".";

export class ExternalResult {
    public sourceId: number;
    public resultDetails: ExternalResultDetail[];

    constructor(sourceId: number, resultDetails: ExternalResultDetail[]) {
        this.sourceId = sourceId;
        this.resultDetails = resultDetails;
    }
}