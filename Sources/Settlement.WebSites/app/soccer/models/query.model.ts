import { ResultDetail } from './result-detail.model';
import { ApiKeys } from '../constants';
export class SettleQuery {
    matchId: number;
    actionName: string;
    selectedResources: ResultDetail[];
    isReSettledTickets: boolean;
    apikey: string;
    constructor(matchId: number, actionName: string, selectedResultDetails: ResultDetail[], isReSettledTickets: boolean) {
        this.matchId = matchId;
        this.actionName = actionName;
        this.selectedResources = selectedResultDetails;
        this.isReSettledTickets = isReSettledTickets;
        this.apikey = ApiKeys.Settle;
    }
}