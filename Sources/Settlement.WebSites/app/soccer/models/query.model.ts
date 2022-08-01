import { ResultDetail } from './result-detail.model';
export class SettleQuery {
    matchId: number;
    actionName: string;
    selectedResources: ResultDetail[];
    isReSettledTickets: boolean;
    constructor(matchId: number, actionName: string, selectedResultDetails: ResultDetail[], isReSettledTickets: boolean) {
        this.matchId = matchId;
        this.actionName = actionName;
        this.selectedResources = selectedResultDetails;
        this.isReSettledTickets = isReSettledTickets;
    }
}