import { Language } from '../../shared/language.native';
import { Injectable } from "@angular/core";
import { Team } from "../models";
import * as _ from "lodash";
import { CompletedStatus, Status } from "../constants";
import { VerifyDeadHeatService } from './verify-deadheat.service';
import { TicketStatusText } from '../../shared/constants';
import { GenerateFilterService } from '../../shared/services';

@Injectable()
export class CalculateService {

    public static ExistRunningStatus(listTeam: Team[]) {
        return listTeam.some(team => _.isEqual(team.status.toLowerCase(), Status.running));
    }

    public static VerifySettledSelected(selectedTeams: Team[], originalTeams: Team[]) {
        const settledTeams = originalTeams.filter(team => !_.isEqual(team.status.toLowerCase(), Status.running));
        const settledTeamOrIds = settledTeams.map(t => t.orId);

        if (selectedTeams.some(t => settledTeamOrIds.includes(t.orId))) {
            return true;
        }

        return false;
    }

    public static existRunningResult(listTeam: Team[], keyValue: keyof Team) {
        return listTeam.some(team => team[keyValue] 
            && typeof team[keyValue] === 'string' 
            && !CompletedStatus.includes((team[keyValue] as string).toLowerCase()));
    }

    public static VerifyDeadHeatNoSet(teamWonSelected: Team[], teamWonSettled: Team[]) {
        const teamWonSelectedNoneDeadHeat = _.filter(teamWonSelected, team => !team.isDeadheat);
        const teamWonSelectedDeadHeat = _.filter(teamWonSelected, team => team.isDeadheat);
        const teamSettledNoneDeadHeat = _.filter(teamWonSettled, team => !team.isDeadheat);


        if ((teamWonSelectedNoneDeadHeat.length === 1 && teamSettledNoneDeadHeat.length >= 1) ||
            teamWonSelectedNoneDeadHeat.length > 1 || teamWonSelectedDeadHeat.length > 0) {
            return this.MessageInconsistentDeadheat(teamWonSelected.concat(teamWonSettled), Language.Outright.incorrectDeadHeatSetting);
        }
        return "";
    }

    public static VerifyDeadHeatYesSetting(teamWonSelected: Team[], teamWonSettled: Team[]) {
        const teamWonSelectedNoneDeadHeat = _.filter(teamWonSelected, team => !team.isDeadheat);
        const teamWonSelectedDeadHeat = _.filter(teamWonSelected, team => team.isDeadheat);
        const teamSettledDeadHeat = _.filter(teamWonSettled, team => team.isDeadheat);
        const teamSettledNoneDeadHeat = _.filter(teamWonSettled, team => !team.isDeadheat);

        if (teamWonSelectedNoneDeadHeat.length > 1) {
            return this.MessageInconsistentDeadheat(teamWonSelected.concat(teamWonSettled), Language.Outright.incorrectDeadHeatSetting);
        }

        if (teamWonSelectedNoneDeadHeat.length === 1 && ((teamSettledNoneDeadHeat.length >= 1 && _.isEmpty(teamSettledDeadHeat)) ||
            !_.isEmpty(teamSettledDeadHeat) ||
            !_.isEmpty(teamWonSelectedDeadHeat))) {

            return this.MessageInconsistentDeadheat(teamWonSelected.concat(teamWonSettled), Language.Outright.incorrectDeadHeatSetting);

        }

        if (VerifyDeadHeatService.VerifyDeadheatSettingYes(teamWonSelected, teamWonSettled)) {
            return this.MessageInconsistentDeadheat(teamWonSelected.concat(teamWonSettled), Language.Outright.inconsistentDeadheat);
        }

        return "";
    }

    public static VerifyDeadHeatNoSetting(teamWonSelected: Team[], teamWonSettled: Team[]) {
        const teamWonSelectedDeadHeat = _.filter(teamWonSelected, team => team.isDeadheat);

        if (teamWonSelectedDeadHeat.length > 0) {
            return this.MessageInconsistentDeadheat(teamWonSelected.concat(teamWonSettled), Language.Outright.incorrectDeadHeatSetting);
        }

        if (VerifyDeadHeatService.VerifyDeadheatSettingNo(teamWonSelected, teamWonSettled)) {
            return this.MessageInconsistentDeadheat(teamWonSelected.concat(teamWonSettled), Language.Outright.inconsistentDeadheat);
        }

        return "";
    }

    public static ConfirmDeadHeatNoSetting(teamWonSelected: Team[], teamWonSettled: Team[]) {
        const teamSettledDeadHeat = _.filter(teamWonSettled, team => team.isDeadheat);
        const teamSettledNoneDeadHeat = _.filter(teamWonSettled, team => !team.isDeadheat);
        const teamWonSelectedNoneDeadHeat = _.filter(teamWonSelected, team => !team.isDeadheat);

        if (teamWonSelectedNoneDeadHeat.length === 1 && teamSettledNoneDeadHeat.length >= 1 && _.isEmpty(teamSettledDeadHeat)) {
            return true;
        }

        if (teamWonSelectedNoneDeadHeat.length > 1 && _.isEmpty(teamSettledDeadHeat)) {
            return true;
        }

        return false;
    }

    public static MessageInconsistentDeadheat(wonTeams: Team[], message: string) {
        const teamNames = wonTeams.map(item => item.teamName);
        return message.replace('{0}', `<br/>${teamNames.join(' | ')}`);
    }

    public static VerifyOnlyOneTeamWon(teamWonSelected: Team[], teamWonSettled: Team[]) {
        if (_.isEqual(teamWonSelected.length, 1) && teamWonSelected[0].isDeadheat && _.isEmpty(teamWonSettled)) {
            return true;
        }
        return false;
    }

    public static VerifyNonDeadheat(teamWonSelected: Team[], teamWonSettled: Team[]) {
        const teamDeadHeat = _.filter(teamWonSelected, team => team.isDeadheat);
        const teamWithoutDeadheat = _.filter(teamWonSelected, team => !team.isDeadheat);
        const teamWithoutDeadheatSettled = _.filter(teamWonSettled, team => !team.isDeadheat);

        if (_.isEmpty(teamDeadHeat) && teamWithoutDeadheat.length > 1) {
            return true;
        }

        if (_.isEmpty(teamDeadHeat) && teamWithoutDeadheatSettled.length > 0 && teamWithoutDeadheat.length > 0) {
            return true;
        }
        return false;
    }

    public renderTicketStatus() {
        const selection = [
            { id: 1, value: TicketStatusText.running, text: TicketStatusText.running, checked: true },
            { id: 2, value: TicketStatusText.calculated, text: TicketStatusText.calculated },
            { id: 3, value: TicketStatusText.noTicketHide, text: TicketStatusText.noTicketHide },
            { id: 4, value: TicketStatusText.noTicket, text: TicketStatusText.noTicket }
        ];


        return GenerateFilterService.createListOption(selection);
    }


    public static teamWonSettled(teamSelected: Team[], originalTeam: Team[]) {
        const teamNotSelectButSettled = _.filter(originalTeam, team =>
            _.isUndefined(teamSelected.find(t => _.isEqual(t.orId, team.orId)))
            && _.isEqual(team.oddsStatus.toLowerCase(), Status.completed)
            && _.isEqual(team.status.toLowerCase(), Status.won)
        );
        return teamNotSelectButSettled;
    }

}
