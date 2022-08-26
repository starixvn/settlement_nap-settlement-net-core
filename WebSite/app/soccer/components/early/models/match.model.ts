import { Permission, TicketCount, ResultDetail } from '../../../models';
import { MatchDetail } from './';
export class Match {
    public matchDetail: MatchDetail;
    public permission: Permission;
    public ticketCounts: TicketCount;
    public resultDetail: ResultDetail[];
}