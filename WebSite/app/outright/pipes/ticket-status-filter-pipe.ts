import { Injectable, Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";
import { Team } from "../models";
import { TicketStatusText } from "../../shared/constants";

@Pipe({
    name: "ticketStatusFilter",
    standalone: true,
})
@Injectable()
export class TicketStatusFilterPipe implements PipeTransform {
    public transform(teams: Team[], ticketStatusSelected: string) {
        if (_.isEmpty(ticketStatusSelected)) {
            return teams;
        }
        return teams.filter(t => {
            return ticketStatusSelected.split(',').some(status => {
                switch (status) {
                    case TicketStatusText.running:
                        return t.totalRunning;
                    case TicketStatusText.calculated:
                        return t.totalCal;
                    case TicketStatusText.noTicketHide:
                        return t.totalHide > 0 && !t.betCount;
                    case TicketStatusText.noTicket:
                        return !t.betCount && !t.totalHide;
                    default:
                        return false;
                }
            });
        });
    }
}
