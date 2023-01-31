import { Language } from './../../shared/language';
import { Injectable } from "@angular/core";
import { Team } from "../models";
import * as _ from "lodash";
import { Status } from "../constants";

@Injectable()
export class CalculateService {
    public ExistRunningStatus(listTeam: Team[]) {
        return listTeam.some(team => _.isEqual(team.status.toLowerCase(), Status.Running));
    }

    public VerifyDeadheat(wonTeams: Team[]) {
        const teamDeadHeat = _.filter(wonTeams, team => team.isDeadheat);
        const teamWithoutDeadheat = _.filter(wonTeams, team => !team.isDeadheat);

        if (!_.isEmpty(teamDeadHeat) && !_.isEmpty(teamWithoutDeadheat)) {
            return true;
        }
        return false;
    }

    public MessageInconsistentDeadheat(wonTeams: Team[]) {
        let message = "<br/>";
        wonTeams.forEach(team => message += `- ${team.teamName}<br/>`);
        return Language.Outright.inconsistentDeadheat.replace('{0}', message);
    }

    public VerifyOnlyOneTeamWon(teamWonSelected: Team[], teamWonSettled: Team[]) {
        if (_.isEqual(teamWonSelected.length, 1) && teamWonSelected[0].isDeadheat && _.isEmpty(teamWonSettled)) {
            return true;
        }
        return false;
    }

    public VerifyNonDeadheat(wonTeams: Team[]) {
        const teamDeadHeat = _.filter(wonTeams, team => team.isDeadheat);
        const teamWithoutDeadheat = _.filter(wonTeams, team => !team.isDeadheat);

        if (_.isEmpty(teamDeadHeat) && !_.isEmpty(teamWithoutDeadheat)) {
            return true;
        }
        return false;
    }

    public teamWonSettled(teamSelected: Team[], originalTeam: Team[]) {
        const teamNotSelectButSettled = _.filter(originalTeam, team =>
            _.isUndefined(teamSelected.find(t => _.isEqual(t.teamName, team.teamName)))
            && _.isEqual(team.oddsStatus.toLowerCase(), Status.Completed)
            && _.isEqual(team.status.toLowerCase(), Status.Won)
        );
        return teamNotSelectButSettled;
    }

}
