import { TicketCount, ResultDetail } from '../../../models';
import { Permission } from '../../../../shared/models/sportsbook-sop';
import { MatchDetail } from './';
export class Match {
    public matchDetail: MatchDetail;
    public permission: Permission;
    public ticketCounts: TicketCount;
    public resultDetail: ResultDetail[];
}