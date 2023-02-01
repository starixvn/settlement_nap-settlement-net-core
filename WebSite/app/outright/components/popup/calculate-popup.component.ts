import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from './../../services/outright.service';
import { Component, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { LeagueSettle, Team, TeamSettle } from '../../models';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { FilterStatuses, TeamStatuses, StatusId, Status } from '../../constants';
import * as _ from "lodash";
import { StatusPipe } from '../../pipes/status-pipe';
import { CalculateService } from '../../services';
import { Language } from '../../../shared/language';
import { ModalDialogMessage } from '../../../shared/models';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'calculate-popup',
  templateUrl: './calculate-popup.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, DatepickerComponent, ToastContainerModule, StatusPipe, MatDialogModule, DragDropModule ],
  providers: [OutrightService, HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService, CalculateService],
})
export class CalculatePopupComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public blockUI = true;
  public teams: Team[];
  public originalTeam: Team[];
  public leagueSettle: LeagueSettle;
  public moveBetsDay: NgbDateStruct;
  public today: NgbDateStruct;
  public teamStatus = TeamStatuses;
  public filterStatuses = FilterStatuses;
  public statusSelected = FilterStatuses[0].toUpperCase();
  public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  private teamSettleWon: Team[];
  constructor(protected injector: Injector,
    private readonly toastrService: ToastrService,
    private readonly outrightService: OutrightService,
    private readonly verifyDateService: VerifyDateService,
    private readonly dialogRef: MatDialogRef<CalculatePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { leagueId: number, sportType: number }) {
    this.confirmationDialogMessage.title = Language.confirmationBox;
    this.confirmationDialogMessage.message = Language.Outright.nonDeadHeatConfirm;
    this.injector.get(MatDialog).closeAll();
  }

  ngOnInit(): void {
    this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastrService.overlayContainer = this.toastContainer;
    this.getMatches();
  }

  public get teamSelected(): Team[] {
    return _.filter(this.teams, team => team.selected);
  }

  async getMatches() {
    this.leagueSettle = await this.outrightService.getMatches(this.data.leagueId, this.data.sportType, StatusId.RunningAndCompleted);
    this.leagueSettle.teams.forEach(team => {
      team.dateTime = this.verifyDateService.convertToDateStruct(team.eventDate);
      team.status = team.status.toUpperCase();
    });
    this.moveBetsDay = this.verifyDateService.convertToDateStruct(this.leagueSettle.moveBetsDay);
    this.today = this.verifyDateService.convertToDateStruct(this.leagueSettle.today);
    this.teams = this.leagueSettle.teams;
  }

  public close() {
    this.dialogRef.close();
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
    const teamWonSettled = CalculateService.teamWonSettled(this.teamSelected, this.originalTeam);
    this.teamSettleWon = teamWonSelected.concat(teamWonSettled);
    this.validateBeforePush(this.teamSettleWon, teamWonSettled)
  };

  private validateBeforePush(teamSettleWon: Team[], teamWonSettled: Team[]) {
    if (CalculateService.ExistRunningStatus(this.teamSelected)) {
      this.toastrService.error(Language.Outright.existRunning);
    } else if (CalculateService.VerifyOnlyOneTeamWon(teamSettleWon, teamWonSettled)) {
      this.toastrService.error(Language.Outright.atLeastTwoDeadHeat);
    } else if (CalculateService.VerifyDeadheat(teamSettleWon, teamWonSettled)) {
      this.toastrService.error(CalculateService.MessageInconsistentDeadheat(teamSettleWon));
    } else if (CalculateService.VerifyNonDeadheat(teamSettleWon)) {
      this.injector.get(MessageBoxService).confirm(this.confirmationDialogMessage, () => {
        this.doCalculate(this.teamSettleWon.length);
      });
    } else {
      this.doCalculate(this.teamSettleWon.length);
    }
  }

  private async getLatestData() {
    const latestLeague = await this.outrightService.getMatches(this.data.leagueId, this.data.sportType, StatusId.RunningAndCompleted);
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
      this.dialogRef.close();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }
}
