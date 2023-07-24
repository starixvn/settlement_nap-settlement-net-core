import { Injectable, Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";
import { Team } from "../models";
import { TicketStatusText } from "../../shared/constants";

@Pipe({
    name: "ticketStatus",
    standalone: true,
})
@Injectable()
export class TicketStatusPipe implements PipeTransform {
    public transform(team: Team) {
        switch (true) {
            case team.totalRunning > 0:
                return TicketStatusText.running;
            case team.totalCal > 0:
                return TicketStatusText.calculated;
            default:
                return TicketStatusText.noTicket;
        }
    }
}
