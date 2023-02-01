import { Language } from './../../shared/language';
import { Injectable } from "@angular/core";
import { Team } from "../models";
import * as _ from "lodash";
import { Status } from "../constants";

@Injectable()
export class CalculateService {

    public static ExistRunningStatus(listTeam: Team[]) {
        return listTeam.some(team => _.isEqual(team.status.toLowerCase(), Status.Running));
    }

    public static VerifyDeadheat(teamWonSelected: Team[], teamWonSettled: Team[]) {
        const teamSettledDeadHeat = _.filter(teamWonSettled, team => team.isDeadheat);
        const teamSettledNoneDeadHeat = _.filter(teamWonSettled, team => !team.isDeadheat);
        const teamWonSelectedDeadHeat = _.filter(teamWonSelected, team => team.isDeadheat);

        if (!(_.isEmpty(teamSettledDeadHeat) || _.isEmpty(teamWonSelected))) {
            return true;
        }

        if(!(_.isEmpty(teamWonSelectedDeadHeat) || _.isEmpty(teamSettledNoneDeadHeat))) {
            return true;
        }

        if(!(_.isEmpty(teamSettledDeadHeat) || _.isEmpty(teamWonSelectedDeadHeat))) {
            return true;
        }

        return false;
    }

    public static MessageInconsistentDeadheat(wonTeams: Team[]) {
        let message = "<br/>";
        wonTeams.forEach(team => message += `${team.teamName} | `);
        return Language.Outright.inconsistentDeadheat.replace('{0}', message);
    }

    public static VerifyOnlyOneTeamWon(teamWonSelected: Team[], teamWonSettled: Team[]) {
        if (_.isEqual(teamWonSelected.length, 1) && teamWonSelected[0].isDeadheat && _.isEmpty(teamWonSettled)) {
            return true;
        }
        return false;
    }

    public static VerifyNonDeadheat(wonTeams: Team[]) {
        const teamDeadHeat = _.filter(wonTeams, team => team.isDeadheat);
        const teamWithoutDeadheat = _.filter(wonTeams, team => !team.isDeadheat);

        if (_.isEmpty(teamDeadHeat) && teamWithoutDeadheat.length > 1) {
            return true;
        }
        return false;
    }

    public static teamWonSettled(teamSelected: Team[], originalTeam: Team[]) {
        const teamNotSelectButSettled = _.filter(originalTeam, team =>
            _.isUndefined(teamSelected.find(t => _.isEqual(t.teamName, team.teamName)))
            && _.isEqual(team.oddsStatus.toLowerCase(), Status.Completed)
            && _.isEqual(team.status.toLowerCase(), Status.Won)
        );
        return teamNotSelectButSettled;
    }

}
