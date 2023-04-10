import { Injectable } from "@angular/core";
import { Team } from "../models";
import * as _ from "lodash";

@Injectable()
export class VerifyDeadHeatService {
    public static VerifyDeadheatSettingYes(teamWonSelected: Team[], teamWonSettled: Team[]) {
        const teamSettledDeadHeat = _.filter(teamWonSettled, team => team.isDeadheat);
        const teamSettledNoneDeadHeat = _.filter(teamWonSettled, team => !team.isDeadheat);
        const teamWonDeadHeatSelected = _.filter(teamWonSelected, team => team.isDeadheat);
        const teamWonNonDeadHeatSelected = _.filter(teamWonSelected, team => !team.isDeadheat);

        if (!_.isEmpty(teamWonDeadHeatSelected) && !_.isEmpty(teamSettledDeadHeat)) {
            return true;
        }

        if (!_.isEmpty(teamWonDeadHeatSelected) && !_.isEmpty(teamSettledNoneDeadHeat)) {
            return true;
        }

        if(!_.isEmpty(teamWonNonDeadHeatSelected) && !_.isEmpty(teamSettledDeadHeat)){
            return true;
        }

        return false;
    }

    public static VerifyDeadheatSettingNo(teamWonSelected: Team[], teamWonSettled: Team[]) {
        const teamSettledDeadHeat = _.filter(teamWonSettled, team => team.isDeadheat);
        const teamWonNonDeadHeatSelected = _.filter(teamWonSelected, team => !team.isDeadheat);

        if (!_.isEmpty(teamWonNonDeadHeatSelected) && !_.isEmpty(teamSettledDeadHeat)) {
            return true;
        }

        return false;
    }
}