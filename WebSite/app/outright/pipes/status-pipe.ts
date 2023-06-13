import { Injectable, Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";
import { FilterStatuses } from "../constants/options";
import { Team } from "../models";
import { Status } from "../constants";

@Pipe({
  name: "status",
  standalone: true,
})
@Injectable({
  providedIn: "root",
})
export class StatusPipe implements PipeTransform {
  private readonly runningStatus = [
    Status.running,
    Status.internal,
    Status.closed,
  ];
  private readonly completedStatus = [
    Status.won,
    Status.lose,
    Status.refund,
    Status.hide,
  ];

  public transform(teams: Team[], status: string) {
    return _.isEqual(status.toLowerCase(), FilterStatuses[0].toLowerCase())
      ? teams
      : this.filterStatus(teams, status);
  }

  private filterStatus(teams: Team[], status: string) {
    if (_.isEqual(status.toLowerCase(), Status.running)) {
      return _.filter(teams, (team) =>
        _.includes(this.runningStatus, team.status.toLowerCase())
      );
    }

    return _.filter(teams, (team) =>
      _.includes(this.completedStatus, team.status.toLowerCase())
    );
  }
}
