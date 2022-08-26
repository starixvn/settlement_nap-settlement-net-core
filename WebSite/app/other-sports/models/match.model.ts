import { HedgeMatchDetail, ResultDetail } from "../../shared/models/sportsbook-sop";
import { TicketCount } from "../../shared/models";
import { MatchDetail } from "./match-detail.model";

export class Match {
    public matchDetail: MatchDetail;
    public ticketCount: TicketCount[];
    public resultDetails: ResultDetail[];
    public hedgeMatchDetail: HedgeMatchDetail;
}