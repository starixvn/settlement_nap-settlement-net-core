import { NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from './../../services/outright.service';
import { Component, Inject, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { LeagueSettle, Team, TeamSettle } from '../../models';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { FilterStatuses, TeamStatuses, StatusId, Status } from '../../constants';
import * as _ from "lodash";
import { StatusPipe } from '../../pipes/status-pipe';
import { CalculateService } from '../../services';
import { Language } from '../../../shared/language.native';
import { ItemsSelect, ModalDialogMessage, MultipleSelect } from '../../../shared/models';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ResultOutright } from '../../models/result-outright.model';
import { DynamicHeightDirective } from '../../../shared/directives';
import { DeadHeatSettings } from '../../constants/deadheat-setting';
import { NewMultipleSelectComponent } from '../../../shared/components/multiple-select/multiple-select.component';
import { TicketStatusPipe } from '../../pipes/ticket-status-pipe';
import { TicketStatusFilterPipe } from '../../pipes/ticket-status-filter-pipe';

@Component({
    selector: 'calculate-popup',
    templateUrl: './calculate-popup.component.html',
    standalone: true,
    imports: [CommonModule, DynamicHeightDirective, FormsModule, DatepickerComponent, StatusPipe, TicketStatusPipe, TicketStatusFilterPipe, MatDialogModule, DragDropModule, NewMultipleSelectComponent],
    providers: [DatePipe, OutrightService, HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService, CalculateService, StatusPipe, TicketStatusFilterPipe,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})
export class CalculatePopupComponent implements OnInit {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    private readonly toastrService = inject(ToastrService);
    private readonly outrightService = inject(OutrightService);
    private readonly verifyDateService = inject(VerifyDateService);
    private readonly calculateService = inject(CalculateService);
    public readonly dialogRef = inject(MatDialogRef<CalculatePopupComponent>);
    private readonly dialog = inject(MatDialog);
    private readonly blockUIService = inject(BlockUIService);
    private readonly messageBoxService = inject(MessageBoxService);
    private readonly ticketStatusPipe = inject(TicketStatusFilterPipe);
    private readonly statusPipe = inject(StatusPipe);
    blockUI = true;
    teams: Team[];
    selectAllTeam = false;
    originalTeam: Team[];
    leagueSettle: LeagueSettle;
    moveBetsDay: NgbDateStruct;
    today: NgbDateStruct;
    teamStatus = TeamStatuses;
    filterStatuses = FilterStatuses;
    statusSelected = FilterStatuses[1].toUpperCase();
    ticketsStatusSelect = new MultipleSelect();
    ticketStatusSelected: string;
    readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    private teamSettleWon: Team[];
    teamJustSettled: TeamSettle[] = [];
    private readonly completedStatus = "Completed";
    private readonly statusRunning = [Status.running, Status.closed, Status.internal];

    constructor(@Inject(MAT_DIALOG_DATA) public data: { leagueId: number, sportType: number, eventDate: string }) {
        this.confirmationDialogMessage.title = Language.confirmationBox;
        this.dialog.closeAll();
        this.dialogRef.disableClose = true;
    }

    async ngOnInit(): Promise<void> {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.toastrService.overlayContainer = this.toastContainer;
        await this.getMatches();
        this.ticketsStatusSelect.items = this.calculateService.renderTicketStatus();
    }

    get teamSelected(): Team[] {
        return _.filter(this.teams, team => team.selected);
    }

    async getMatches() {
        this.leagueSettle = await this.outrightService.getMatches(this.data.leagueId, this.data.sportType, StatusId.runningAndCompleted);
        this.leagueSettle.teams.forEach(team => {
            team.status = team.status.toUpperCase();
            team.eventDate = _.includes(this.statusRunning, team.oddsStatus.toLowerCase()) ? this.leagueSettle.today : team.eventDate;
            team.dateTime = this.verifyDateService.convertToDateStruct(team.eventDate);
            team.disableDeadheat = !_.isEqual(team.status, 'WON');
            team.statusClass = this.makeBackgroundByStatus(team.status);
            team.originalStatus = team.status;
        });
        this.moveBetsDay = this.verifyDateService.convertToDateStruct(this.leagueSettle.moveBetsDay);
        this.today = this.verifyDateService.convertToDateStruct(this.leagueSettle.today);
        this.teams = this.leagueSettle.teams;
    }

    close() {
        if (_.isEmpty(this.teamJustSettled)) {
            this.dialogRef.close();
        } else {
            this.dialogRef.close(this.teamJustSettled);
        }
    }

    clearError() {
        this.toastrService.clear();
    };

    disableCalculate() {
        return _.isEmpty(this.teamSelected) || !this.leagueSettle.permission.canCalculateOutright;
    }

    get viewRecalculate() {
        return this.leagueSettle.permission.isLeader;
    }

    get disableRecalculate() {
        return _.isEmpty(this.teamSelected)
    }

    selectStatus() {
        this.selectAllTeam = false;
        this.teams.forEach(team => team.selected = false);
    }

    onSelectTicketsStatus(value: ItemsSelect[]) {
        this.selectStatus();
        this.ticketStatusSelected = value.length > 0 ? value.map(item => item.value).join() : "";
    }

    changeStatus(team: Team) {
        this.clearError();

        if (!_.isEqual(team.status, 'WON')) {
            team.isDeadheat = false;
            team.disableDeadheat = true;
            return;
        }
        team.disableDeadheat = false;
    }

    public async calculate(isCalc = true) {
        this.clearError();
        await this.getLatestData();
        const teamWonSelected = _.filter(this.teamSelected, team => _.isEqual(team.status.toLowerCase(), Status.won));
        const teamWonSettled = CalculateService.teamWonSettled(this.teamSelected, this.originalTeam);
        const teamHideSelected = _.filter(this.teamSelected, team => _.isEqual(team.status.toLowerCase(), Status.hide));
        this.teamSettleWon = teamWonSelected.concat(teamWonSettled);
        await this.validateBeforePush(teamWonSettled, teamWonSelected, teamHideSelected, isCalc)
    };

    onSelectDate(value: NgbDateStruct, team: Team) {
        team.eventDate = this.verifyDateService.format(value);
    }

    public onSelectAllTeam(e: boolean) {
        const filteredTeams = this.fillteredTeam()
        this.teams.forEach(team => {
            const isShowed = filteredTeams.some(value => value.orId === team.orId);
            team.selected = isShowed ? e : false;
        });
    }

    fillteredTeam() {
        const filterStatus = this.statusPipe.transform(this.teams, this.statusSelected);
        const filterTicketStatus = this.ticketStatusPipe.transform(filterStatus, this.ticketStatusSelected);

        return filterTicketStatus;
    }

    onSelectTeam() {
        const filteredTeams = this.fillteredTeam()
        const selectedTeams = filteredTeams.every(team => team.selected);
        this.selectAllTeam = selectedTeams;

    }

    private async validateBeforePush(teamWonSettled: Team[], teamWonSelected: Team[], teamHideSelected: Team[], isCalc = true) {
        if (isCalc && CalculateService.VerifySettledSelected(this.teamSelected, this.originalTeam)) {
            this.toastrService.error(Language.Outright.existTeamSettled);
        } else if (CalculateService.ExistRunningStatus(this.teamSelected)) {
            this.toastrService.error(Language.Outright.existRunning);
        } else if (CalculateService.VerifyOnlyOneTeamWon(teamWonSelected, teamWonSettled)) {
            this.toastrService.error(Language.Outright.atLeastTwoDeadHeat);
        } else {
            this.verifyDeadHead(teamWonSettled, teamWonSelected, teamHideSelected);
        }
    }

    private async verifyDeadHead(teamWonSettled: Team[], teamWonSelected: Team[], teamHideSelected: Team[]) {
        const setting = await this.outrightService.getDeadHeatSetting(this.data.leagueId);
        const errorSettingMessage = this.verifySetting(setting, teamWonSettled, teamWonSelected);
        if (!_.isEmpty(errorSettingMessage)) {
            this.toastrService.error(errorSettingMessage);
        } else if (!(await this.VerifyHideStatus(teamHideSelected))) {
            this.toastrService.error(Language.Outright.existHideTicketNotVoided)
        } else if (setting === DeadHeatSettings.No && CalculateService.ConfirmDeadHeatNoSetting(teamWonSelected, teamWonSettled)) {
            this.confirmCalcNonDeadheat();
        } else {
            this.doCalculate(this.teamSettleWon.length);
        }
    }

    private verifySetting(setting: number, teamWonSettled: Team[], teamWonSelected: Team[]) {
        let errorSettingMessage = "";
        switch (setting) {
            case DeadHeatSettings.No:
                errorSettingMessage = CalculateService.VerifyDeadHeatNoSetting(teamWonSelected, teamWonSettled);
                break;
            case DeadHeatSettings.Yes:
                errorSettingMessage = CalculateService.VerifyDeadHeatYesSetting(teamWonSelected, teamWonSettled);
                break;
            default: errorSettingMessage = CalculateService.VerifyDeadHeatNoSet(teamWonSelected, teamWonSettled);
        }

        return errorSettingMessage;
    }

    private confirmCalcNonDeadheat() {
        this.confirmationDialogMessage.message = Language.Outright.nonDeadHeatConfirm;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doCalculate(this.teamSettleWon.some(team => team.isDeadheat) ? this.teamSettleWon.length : 1);
        });
    }

    private async getLatestData() {
        const latestLeague = await this.outrightService.getMatches(this.data.leagueId, this.data.sportType, StatusId.runningAndCompleted);
        latestLeague.teams.forEach(team => {
            team.dateTime = this.verifyDateService.convertToDateStruct(team.eventDate);
            team.status = team.status.toUpperCase();
        });
        this.originalTeam = latestLeague.teams;
    }

    private async doCalculate(deadHeat: number) {
        this.confirmationDialogMessage.message = Language.Outright.confirmCalculate;
        this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
            const teams = this.teamSelected.map(team => new TeamSettle(team.orId, team.teamId.toString(), team.isDeadheat, team.status, team.eventDate));
            const result = await this.outrightService.calculate(teams, deadHeat);
            if (result.isSuccessful) {
                const listMatchIdJustSettled = teams.map(t => t.matchId);
                this.dialogRef.close([...teams, ...this.teamJustSettled.filter(t => !listMatchIdJustSettled.includes(t.matchId))]);
            } else {
                this.processResultFail(result, teams);
            }
        });
    }

    private processResultFail(result: ResultOutright, teamSettle: TeamSettle[]) {
        if (!_.isEmpty(result.teamFailedIds)) {
            const listMatch = result.teamFailedIds.split(',');
            this.teamJustSettled = this.teamJustSettled.concat(_.filter(teamSettle, team => !listMatch.includes(team.matchId.toString())));
            _.forEach(this.teamJustSettled, team => _.find(this.leagueSettle.teams, t => _.isEqual(t.orId, team.matchId)).oddsStatus = this.completedStatus);
        }
        this.toastrService.error(result.errMsg);
    }

    makeBackgroundByStatus(status: string) {
        if (_.isEqual(status.toLocaleLowerCase(), 'running')) {
            return '';
        }
        return 'calculated';
    }

    async VerifyHideStatus(teamHideSelected: Team[]) {
        for (const team of teamHideSelected) {
            const result = await this.checkVoidTicket(team);
            if (!result) {
                return false;
            }
        }
        return true;
    }

    private async checkVoidTicket(teamHide: Team) {
        const result = await this.outrightService.checkVoidTickets(+teamHide.orId);
        return result;
    }
}
