import { Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";
import { FilterStatuses } from "../constants/options";
import { Team } from "../models";

@Pipe({
    name: 'status',
    standalone: true
})

export class StatusPipe implements PipeTransform {
    private readonly runningStatus = ['running', 'internal', 'closed'];
    private readonly completedStatus = ['won', 'lose', 'refund'];

    public transform(teams: Team[], status: string) {
        return _.isEqual(status.toLowerCase(), FilterStatuses[0].toLowerCase()) ?
            teams : this.filterStatus(teams, status);
    }

    private filterStatus(teams: Team[], status: string) {
        if (_.isEqual(status.toLowerCase(), "running")) {
            return _.filter(teams, team => _.includes(this.runningStatus, team.status.toLowerCase()));
        }

        return _.filter(teams, team => _.includes(this.completedStatus, team.status.toLowerCase()));
    }
}