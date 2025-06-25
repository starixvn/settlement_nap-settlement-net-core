import { ExternalResultDetail } from "./external-result-detail.model";

export class SaveScoreQuery {
    matchId: number;
    apiKey: string;
    scoresToSave: ExternalResultDetail[];
    checkedScores: ExternalResultDetail[];
}