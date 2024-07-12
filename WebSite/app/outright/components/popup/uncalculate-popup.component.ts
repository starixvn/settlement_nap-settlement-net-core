import { Language } from '../../../shared/language.native';
import { LeagueSettle, Team } from '../../models';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit, Inject, Injector } from '@angular/core';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { OutrightService } from '../../services/outright.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { FormsModule } from '@angular/forms';
import * as _ from 'lodash';
import { StatusId } from '../../constants/status-id.model';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ModalDialogMessage } from '../../../shared/models';
import { ResultOutright } from '../../models/result-outright.model';

@Component({
  selector: 'uncalculate-popup',
  templateUrl: './uncalculate-popup.component.html',
  standalone: true,
  imports: [CommonModule,  MatDialogModule, DragDropModule, FormsModule,ToastContainerModule],
  providers: [OutrightService, HttpRequestService, BlockUIService, MessageBoxService],
})
export class UncalculatePopupComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  private outrightService: OutrightService;
  private toastrService: ToastrService;
   dialogRef: MatDialogRef<UncalculatePopupComponent>;
   teams: Team[];
   leagueSettle: LeagueSettle;
   blockUI = true;
   teamJustSettled = "";
   readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  constructor(private readonly injector: Injector,
    @Inject(MAT_DIALOG_DATA)  public data: { leagueId: number, sportType: number }) {
    this.injector.get(MatDialog).closeAll();
    this.confirmationDialogMessage.title = Language.confirmationBox;
    this.dialogRef = this.injector.get(MatDialogRef<UncalculatePopupComponent>);
    this.dialogRef.disableClose = true;
  }

  async ngOnInit(){
    this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastrService = this.injector.get(ToastrService);
    this.outrightService = this.injector.get(OutrightService);
    this.toastrService.overlayContainer = this.toastContainer;
    await this.getMatches();
  }

  private async getMatches() {
    this.leagueSettle = await this.outrightService.getMatches(this.data.leagueId, this.data.sportType, StatusId.completed);
    this.teams = this.leagueSettle.teams;
  }

   clearError() {
    this.toastrService.clear();
  };

   close() {
    if (_.isEmpty(this.teamJustSettled)) {
      this.dialogRef.close();
    } else {
      this.dialogRef.close(this.teamJustSettled);
    }
  }

   disableUncalculate() {
    return _.isEmpty(_.filter(this.teams, team => team.selected)) || !this.leagueSettle.permission.canUncalculateOutright;
  }

   async uncalculate() {
    this.clearError();
    this.confirmationDialogMessage.message = Language.Outright.confirmUncalculate;
    this.injector.get(MessageBoxService).confirm(this.confirmationDialogMessage, async () => {
      const selectedMatch = _.filter(this.teams, team => team.selected);
      const matchIds = selectedMatch.map(match => match.orId).join(',');
      const teamIds = selectedMatch.map(match => match.teamId).join(',');
      const result = await this.outrightService.uncalculate(matchIds, teamIds);
      if (result.isSuccessful) {
        const teamChanged = [matchIds, ...this.teamJustSettled.split(',').filter(t => !matchIds.includes(t))];
        this.dialogRef.close(teamChanged.join(','));
      } else {
        this.processResultFail(result, matchIds);
      }
    });
  }

  private processResultFail(result: ResultOutright, matchIds: string) {
    if (!_.isEmpty(result.teamFailedIds)) {
      const listMatch = result.teamFailedIds.split(',');
      const teamSettle = matchIds.split(',');
      this.teamJustSettled = _.filter(teamSettle, team => !listMatch.includes(team.toString())).join(',');
    }
    this.toastrService.error(result.errMsg);
  }
}
