import { MatchDetail, ResultDetail, HedgeMatchDetail, Permission } from './index';
import { TicketCount } from '../ticket-count.model';
import { ExternalResult } from './external-result.model';

export class GeneralMatch {
    public matchDetail: MatchDetail;
    public hedgeMatchDetail: HedgeMatchDetail;
    public externalResults: ExternalResult[];
    public originalResultDetail: ResultDetail[];
    public oldMatchDetail: HedgeMatchDetail;

    public isClickOnCalculate: boolean;
    public isScoreDirect: boolean;
    public permission: Permission;
    public ticketCounts: TicketCount[] | TicketCount;

    constructor(matchDetail: MatchDetail) {
        this.matchDetail = matchDetail;
    }
}