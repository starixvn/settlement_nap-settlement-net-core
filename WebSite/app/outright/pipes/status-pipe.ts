import { Injectable, Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";
import { FilterStatuses } from "../constants/options";
import { Team } from "../models";
import { CompletedStatus, RunningStatus, Status } from "../constants";

@Pipe({
  name: "status",
  standalone: true,
})
@Injectable({
  providedIn: "root",
})
export class StatusPipe implements PipeTransform {
  public transform(teams: Team[], status: string, screenShotStatus: string): Team[] {
    const teamsFilteredByStatus = this.applyStatusFilter(teams, status, false);
    
    return this.applyStatusFilter(teamsFilteredByStatus, screenShotStatus, true);
  }

  private applyStatusFilter(teams: Team[], status: string, isScreenshot: boolean): Team[] {
    if (_.isEqual(status.toLowerCase(), FilterStatuses[0].toLowerCase())) {
      return teams;
    }
    
    return this.filterTeamsByStatus(teams, status, isScreenshot);
  }

  private filterTeamsByStatus(teams: Team[], status: string, isScreenshot: boolean): Team[] {
    const targetStatuses = _.isEqual(status.toLowerCase(), Status.running) ? RunningStatus : CompletedStatus;
    
    return this.filterTeamsByStatusList(teams, targetStatuses, isScreenshot ? 'originalScreenshot' : 'originalStatus');
  }

  private filterTeamsByStatusList(teams: Team[], statusList: string[], propertyName: 'originalStatus' | 'originalScreenshot'): Team[] {
    return _.filter(teams, (team) => {
      const teamStatus = team[propertyName]?.toLowerCase();
      return _.includes(statusList, teamStatus);
    });
  }
}

