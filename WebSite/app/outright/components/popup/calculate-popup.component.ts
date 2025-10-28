import { NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from './../../services/outright.service';
import { Component, Inject, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { LeagueSettle, Permission, Team, TeamSettle } from '../../models';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { FilterStatuses, TeamStatuses, StatusId, Status, RunningStatus, CompletedStatus } from '../../constants';
import * as _ from "lodash";
import { StatusPipe } from '../../pipes/status-pipe';
import { CalculateService } from '../../services';
import { Language } from '../../../shared/language.native';
import { ItemsSelect, ModalDialogMessage, MultipleSelect } from '../../../shared/models';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ResultOutright } from '../../models/result-outright.model';
import { DeadHeatSettings } from '../../constants/deadheat-setting';
import { NewMultipleSelectComponent } from '../../../shared/components/multiple-select/multiple-select.component';
import { TicketStatusPipe } from '../../pipes/ticket-status-pipe';
import { TicketStatusFilterPipe } from '../../pipes/ticket-status-filter-pipe';
import { TeamResult } from '../../models/team-result';

@Component({
    selector: 'calculate-popup',
    templateUrl: './calculate-popup.component.html',
    standalone: true,
    imports: [ToastContainerDirective ,CommonModule, FormsModule, DatepickerComponent, StatusPipe, TicketStatusPipe, TicketStatusFilterPipe, MatDialogModule, DragDropModule, NewMultipleSelectComponent],
    providers: [DatePipe, OutrightService, HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService, CalculateService, StatusPipe, TicketStatusFilterPipe, ToastrService,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})
export class CalculatePopupComponent implements OnInit {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    private readonly toastrService = inject(ToastrService);
    private readonly outrightService = inject(OutrightService);
    private readonly verifyDateService = inject(VerifyDateService);
    private readonly calculateService = inject(CalculateService);
    readonly dialogRef = inject(MatDialogRef<CalculatePopupComponent>);
    private readonly dialog = inject(MatDialog);
    private readonly blockUIService = inject(BlockUIService);
    private readonly messageBoxService = inject(MessageBoxService);
    private readonly ticketStatusPipe = inject(TicketStatusFilterPipe);
    private readonly statusPipe = inject(StatusPipe);
    private readonly completedStatus = "Completed";
    private readonly statusRunning = [Status.running, Status.closed, Status.internal];

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
    screenshotSelected = FilterStatuses[0].toUpperCase();
    readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    private teamSettleWon: Team[];
    teamJustSettled: TeamSettle[] = [];
    permission: Permission;
    loading = false;


    constructor(@Inject(MAT_DIALOG_DATA) public data: { leagueId: number, sportType: number, eventDate: string }) {
        this.confirmationDialogMessage.title = Language.confirmationBox;
        this.dialog.closeAll();
        this.dialogRef.disableClose = true;
    }

    async ngOnInit(): Promise<void> {
        this.toastrService.overlayContainer = this.toastContainer;
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        await this.getMatches();
        this.ticketsStatusSelect.items = this.calculateService.renderTicketStatus();
    }

    get teamSelected(): Team[] {
        return _.filter(this.teams, team => team.selected);
    }

    async getMatches() {
        this.leagueSettle = await this.outrightService.getMatches(this.data.leagueId, this.data.sportType, StatusId.runningAndCompleted);
        this.permission = this.leagueSettle.permission;
        this.leagueSettle.teams.forEach(team => {
            this.loading = true;
            team.status = team.status.toUpperCase();
            team.eventDate = _.includes(this.statusRunning, team.oddsStatus.toLowerCase()) ? this.leagueSettle.today : team.eventDate;
            team.dateTime = this.verifyDateService.convertToDateStruct(team.eventDate);
            team.disableDeadheat = !_.isEqual(team.status, 'WON');
            team.originalStatus = team.status;
            team.originalIsDeadheat = team.isDeadheat;
            team.screenShot = team.screenShot || TeamStatuses[0].text.toUpperCase();
            team.originalScreenshot = team.screenShot;
            team.traderScore = (team.traderScore || TeamStatuses[0].text).toUpperCase();
            team.originalTraderScore = team.traderScore;
            this.autoFillFinalScore(team);
            this.autoChangeDeadheat(team);
            team.traderConfirmClass = this.traderConfirmClass(team);
            this.loading = false;
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

    autoFillFinalScore(team: Team) {
        if(!CompletedStatus.includes(team.originalStatus.toLocaleLowerCase())
            && !_.isEmpty(team.originalTraderScore)
            && _.isEqual(team.screenShot.toLocaleLowerCase(), team.traderScore.toLocaleLowerCase())) {
                team.status = team.traderScore.toUpperCase();
        } else {
            team.status = team.originalStatus.toUpperCase();
        }

        this.changeStatus(team);
    }

    autoChangeDeadheat(team: Team) {
        if(this.permission.isLeader) {
            team.isDeadheat = team.originalIsDeadheat;
            return;
        } 

        if(team.resultStatusId === 3) {
            team.isDeadheat = false;
        }
    }

    traderConfirmClass(team: Team) {
        const confirmStatus = 3;
        if(!_.isEmpty(team.originalTraderScore) 
            &&!CompletedStatus.includes(team.originalStatus.toLocaleLowerCase())
            && _.isEqual(team.resultStatusId, confirmStatus)
        ){
            return 'bg-result-confirmed';
        }
        return '';
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

    onSelectScreenShot(value: ItemsSelect[]) {
        this.selectStatus();
        this.screenshotSelected = value.length > 0 ? value.map(item => item.value).join() : "";
    }

    changeStatus(team: Team) {
        this.clearError();
        team.statusClass = this.makeBackgroundByStatus(team);
        team.mismatchClass = this.mismatchClass(team);
        if (!_.isEqual(team.status, 'WON')) {
            team.isDeadheat = false;
            team.disableDeadheat = true;
            return;
        }
        team.disableDeadheat = false;
    }

    changeTraderScore(team: Team) {
        this.clearError();
        this.autoFillFinalScore(team);

        if (_.isEqual(team.traderScore.toLowerCase(), Status.won.toLowerCase())) {
            team.disableDeadheat = false;
            return;
        }

        team.disableDeadheat = !_.isEqual(team.status, 'WON');
    }

    makeBackgroundByStatus(team: Team) {
        if (!RunningStatus.includes(team.originalStatus.toLocaleLowerCase())) {
            return 'calculated';
        }

        return this.mismatchClass(team);
    }

    private mismatchClass(team: Team) {
        const isMismatchStatusScreenshot = this.isMismatchStatusScreenshot(team);
        const isMismatchStatusTraderScore = this.isMismatchStatusTraderScore(team);
        const isMismatchScreenshotAndTraderScore = this.isMismatchScreenshotAndTraderScore(team);

        if(isMismatchStatusScreenshot || isMismatchStatusTraderScore || isMismatchScreenshotAndTraderScore) {
            return 'status-mismatched';
        }
        return '';
    }

    private isMismatchStatusScreenshot(team: Team) {
        return !_.isEmpty(team.screenShot) 
        && !_.isEmpty(team.status) 
        && !_.isEqual(team.status.toLocaleLowerCase(), team.screenShot.toLocaleLowerCase());
    }

    private isMismatchStatusTraderScore(team: Team) {
        return !_.isEmpty(team.traderScore)
            && !_.isEqual(team.status.toLocaleLowerCase(), Status.running.toLocaleLowerCase())
            && !_.isEqual(team.status.toLocaleLowerCase(), team.traderScore.toLocaleLowerCase());
    }

    private isMismatchScreenshotAndTraderScore(team: Team) {
        return !_.isEmpty(team.screenShot)
            && !_.isEmpty(team.traderScore)
            && !_.isEqual(team.screenShot.toLocaleLowerCase(), Status.running.toLocaleLowerCase())
            && !_.isEqual(team.screenShot.toLocaleLowerCase(), team.traderScore.toLocaleLowerCase());
    }

    changeScreenshot(team: Team) {
        this.clearError();
        this.autoFillFinalScore(team);
    }

    async calculate(isCalc = true) {
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

    onSelectAllTeam(e: boolean) {
        const filteredTeams = this.filteredTeam()
        this.teams.forEach(team => {
            const isShowed = filteredTeams.some(value => value.orId === team.orId);
            team.selected = isShowed ? e : false;
        });
    }

    filteredTeam() {
        const filterStatus = this.statusPipe.transform(this.teams, this.statusSelected, this.screenshotSelected);
        const filterTicketStatus = this.ticketStatusPipe.transform(filterStatus, this.ticketStatusSelected);

        return filterTicketStatus;
    }

    onSelectTeam() {
        const filteredTeams = this.filteredTeam()
        const selectedTeams = filteredTeams.every(team => team.selected);
        this.selectAllTeam = selectedTeams;
    }

    private async validateBeforePush(teamWonSettled: Team[], teamWonSelected: Team[], teamHideSelected: Team[], isCalc = true) {
        if (isCalc && CalculateService.VerifySettledSelected(this.teamSelected, this.originalTeam)) {
            this.toastrService.error(Language.Outright.existTeamSettled);
            return;
        }
        
        if (CalculateService.ExistRunningStatus(this.teamSelected)) {
            this.toastrService.error(Language.Outright.blankScore);
            return;
        }
        
        if (this.verifyScreenshot()) {
            this.toastrService.error(Language.Outright.screenshotMismatch);
            return;
        }
        
        if (this.verifyTraderScore()) {
            this.confirmationDialogMessage.message = Language.eSports.leader.insufficientSources;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.verifyOnlyOneTeamWonAndDeadHeat(teamWonSettled, teamWonSelected, teamHideSelected);
            });
            return;
        }

        this.verifyOnlyOneTeamWonAndDeadHeat(teamWonSettled, teamWonSelected, teamHideSelected);
    }
    
    private verifyOnlyOneTeamWonAndDeadHeat(teamWonSettled: Team[], teamWonSelected: Team[], teamHideSelected: Team[]) {
        if (CalculateService.VerifyOnlyOneTeamWon(teamWonSelected, teamWonSettled)) {
            this.toastrService.error(Language.Outright.atLeastTwoDeadHeat);
        } else {
            this.verifyDeadHead(teamWonSettled, teamWonSelected, teamHideSelected);
        }
    }

    private verifyTraderScore() {
        return this.permission.isLeader && this.teamSelected.some(team => 
            _.isEmpty(team.traderScore) || (!_.isEmpty(team.status) && !_.isEqual(team.status.toLowerCase(), team.traderScore.toLowerCase()))
        );
    }

    private verifyScreenshot() {
        return this.teamSelected.some(team => 
            !_.isEmpty(team.screenShot) && 
            !_.isEmpty(team.status) && 
            !_.isEqual(team.status.toLowerCase(), team.screenShot.toLowerCase())
        );
    }

    private async verifyDeadHead(teamWonSettled: Team[], teamWonSelected: Team[], teamHideSelected: Team[]) {
        const setting = await this.outrightService.getDeadHeatSetting(this.data.leagueId);
        const errorSettingMessage = this.verifySetting(setting, teamWonSettled, teamWonSelected);
        if (!_.isEmpty(errorSettingMessage)) {
            this.toastrService.error(errorSettingMessage);
        }
        
        if(!this.permission.isLeader && CalculateService.verifyDeadHeat(teamWonSelected)) {
            this.toastrService.error(Language.Outright.inconsistentTraderDeadheat);
            return;
        }
        
        if (!(await this.VerifyHideStatus(teamHideSelected))) {
            this.toastrService.error(Language.Outright.existHideTicketNotVoided);
            return;
        }
        
        if (setting === DeadHeatSettings.No && CalculateService.ConfirmDeadHeatNoSetting(teamWonSelected, teamWonSettled)) {
            this.confirmCalcNonDeadheat();
            return;
        }
        
        this.doCalculate(this.teamSettleWon.length);
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
            await this.outrightService.saveScore(this.teamSelected);
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

    saveScore() {
        this.toastrService.clear();
        this.confirmationDialogMessage.message = Language.eSports.saveScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
            await this.outrightService.saveScore(this.teamSelected);
            this.dialogRef.close();
        });
    }

    async saveTraderScore() {
        this.toastrService.clear();
        await this.getLatestData();
        if (CalculateService.VerifySettledSelected(this.teamSelected, this.originalTeam)) {
            this.toastrService.error(Language.Outright.existTeamSettled);
            return;
        }

        this.confirmationDialogMessage.message = Language.SaveTraderScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
            const teams = this.teamSelected.map(team => ({
                orId: team.orId,
                teamId: team.teamId,
                result: team.traderScore,
                isDeadheat: team.isDeadheat
            }) as TeamResult);
            await this.outrightService.saveTraderScore(this.data.leagueId, teams);
            this.dialogRef.close();
        });
    }

    getWonRefundConfirmClass(team: Team) {
        if(!this.permission.isLeader) {
            return '';
        }

        if(_.isEqual(team.originalTraderScore.toLowerCase(), Status.refund) && team.resultStatusId === 3) {
            return 'bg-result-refund';
        }

        if(_.isEqual(team.originalTraderScore.toLowerCase(), Status.won) && team.resultStatusId === 3) {
            return 'bg-result-won';
        }

        return '';
    }
}
