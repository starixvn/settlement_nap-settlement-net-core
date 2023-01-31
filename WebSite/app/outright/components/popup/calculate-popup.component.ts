import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from './../../services/outright.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { LeagueSettle, Team, TeamSettle } from '../../models';
import { UrlHelper } from '../../../helper';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { FilterStatuses, TeamStatuses, StatusId, Status } from '../../constants';
import * as _ from "lodash";
import { StatusPipe } from '../../pipes/status-pipe';
import { CalculateService } from '../../services';
import { Language } from '../../../shared/language';
import { ModalDialogMessage } from '../../../shared/models';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';

@Component({
    selector: 'calculate-popup',
    templateUrl: './calculate-popup.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastContainerModule, HttpClientModule, DatepickerComponent, StatusPipe],
    providers: [OutrightService, HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService, CalculateService],
})
export class CalculatePopupComponent implements OnInit {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public blockUI = true;
    public teams: Team[];
    public originalTeam: Team[];
    public leagueSettle: LeagueSettle;
    public moveBetsDay: NgbDateStruct;
    public maxDate: NgbDateStruct;
    public teamStatus = TeamStatuses;
    public filterStatuses = FilterStatuses;
    public statusSelected = FilterStatuses[0].toUpperCase();
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    private teamSettleWon: Team[];
    private leagueId: number;
    private sportType: number;
    constructor(private readonly blockUIService: BlockUIService,
        private readonly toastrService: ToastrService,
        private readonly outrightService: OutrightService,
        private readonly verifyDateService: VerifyDateService,
        private readonly calendar: NgbCalendar,
        private readonly calculateService: CalculateService,
        private readonly messageBoxService: MessageBoxService) {
        this.maxDate = calendar.getToday();
        this.confirmationDialogMessage.title = Language.confirmationBox;
        this.confirmationDialogMessage.message = Language.Outright.nonDeadHeatConfirm;
    }

    ngOnInit(): void {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.toastrService.overlayContainer = this.toastContainer;
        this.getMatches();
    }

    public get teamSelected(): Team[] {
        return _.filter(this.teams, team => team.selected);
    }

    async getMatches() {
        this.leagueId = Number(UrlHelper.getUrlParameter('leagueId'));
        this.sportType = Number(UrlHelper.getUrlParameter('sportType'));
        this.leagueSettle = await this.outrightService.getMatches(this.leagueId, this.sportType, StatusId.RunningAndCompleted);
        this.leagueSettle.teams.forEach(team => {
            team.dateTime = this.verifyDateService.convertToDateStruct(team.eventDate);
            team.status = team.status.toUpperCase();
        });
        this.moveBetsDay = this.verifyDateService.convertToDateStruct(this.leagueSettle.moveBetsDay);
        this.teams = this.leagueSettle.teams;
    }

    public clearError() {
        this.toastrService.clear();
    };

    public disableCalculate() {
        return _.isEmpty(this.teamSelected) || !this.leagueSettle.permission.canCalculateOutright;
    }

    public selectStatus() {
        this.teams.forEach(team => team.selected = false);
    }

    public changeStatus(team: Team) {
        this.clearError();
        if (!_.isEqual(team.status, 'WON')) {
            team.isDeadheat = false;
            team.disableDeadheat = true;
            return;
        }
        team.disableDeadheat = false;
    }

    public async calculate() {
        this.clearError();
        await this.getLatestData();
        const teamWonSelected = _.filter(this.teamSelected, team => _.isEqual(team.status.toLowerCase(), Status.Won));
        const teamWonSettled = this.calculateService.teamWonSettled(this.teamSelected, this.originalTeam);
        this.teamSettleWon = teamWonSelected.concat(teamWonSettled);
        this.validateBeforePush(this.teamSettleWon, teamWonSettled)
    };

    private validateBeforePush(teamSettleWon: Team[], teamWonSettled: Team[]) {
        if (this.calculateService.ExistRunningStatus(this.teamSelected)) {
            this.toastrService.error(Language.Outright.existRunning);
        } else if (this.calculateService.VerifyOnlyOneTeamWon(teamSettleWon, teamWonSettled)) {
            this.toastrService.error(Language.Outright.atLeastTwoDeadHeat);
        } else if (this.calculateService.VerifyDeadheat(teamSettleWon)) {
            this.toastrService.error(this.calculateService.MessageInconsistentDeadheat(teamSettleWon));
        } else if (this.calculateService.VerifyNonDeadheat(teamSettleWon)) {
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.doCalculate(this.teamSettleWon.length);
            });
        } else {
            this.doCalculate(this.teamSettleWon.length);
        }
    }

    private async getLatestData() {
        const latestLeague = await this.outrightService.getMatches(this.leagueId, this.sportType, StatusId.RunningAndCompleted);
        latestLeague.teams.forEach(team => {
            team.dateTime = this.verifyDateService.convertToDateStruct(team.eventDate);
            team.status = team.status.toUpperCase();
        });
        this.originalTeam = latestLeague.teams;
    }

    private async doCalculate(deadHeat: number) {
        const teams = this.teamSelected.map(team => new TeamSettle(team.orId, team.teamId.toString(), team.isDeadheat, team.status, team.eventDate));
        const result = await this.outrightService.calculate(teams, deadHeat);
        if (result.isSuccessful) {
            this.messageBoxService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }
}
