import { ExternalResultDetail } from "./external-result-detail.model";
import { ExternalResult } from "./external-result.model";

export class SaveScoreQuery {
    matchId: number;
    apiKey: string;
    scoresToSave: ExternalResultDetail[];
    checkedScores: ExternalResultDetail[];
}