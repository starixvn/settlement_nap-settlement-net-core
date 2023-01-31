import { LeagueSettle, Team } from '../../models';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit, Inject, Injector } from '@angular/core';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { OutrightService } from '../../services/outright.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { FormsModule } from '@angular/forms';

import * as _ from 'lodash';
import { StatusId } from '../../constants/status-id.model';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'uncalculate-popup',
  templateUrl: './uncalculate-popup.component.html',
  standalone: true,
  imports: [CommonModule, ToastContainerModule,  MatDialogModule, DragDropModule, FormsModule],
  providers: [OutrightService, HttpRequestService, BlockUIService, MessageBoxService],
})
export class UncalculatePopupComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public teams: Team[];
  public leagueSettle: LeagueSettle;
  public blockUI = true;
  private leagueId: number;
  private sportType: number;

  constructor(private readonly toastrService: ToastrService,
    private readonly outrightService: OutrightService,
    private readonly injector: Injector,
    private readonly dialogRef: MatDialogRef<UncalculatePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { leagueId: number, sportType: number }) {
    this.leagueId = data.leagueId;
    this.sportType = data.sportType;
  }
  ngOnInit(): void {
    this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastrService.overlayContainer = this.toastContainer;
    this.getMatches();
  }

  async getMatches() {
    this.leagueSettle = await this.outrightService.getMatches(this.leagueId, this.sportType, StatusId.Completed);
    this.teams = this.leagueSettle.teams;
  }

  public clearError() {
    this.toastrService.clear();
  };

  public close(){
    this.dialogRef.close();
  }

  public disableUncalculate() {
    return _.isEmpty(_.filter(this.teams, team => team.selected)) || !this.leagueSettle.permission.canUncalculateOutright;
  }

  public async uncalculate() {
    this.clearError();
    const selectedMatch = _.filter(this.teams, team => team.selected);
    const matchIds = selectedMatch.map(match => match.orId).join(',');
    const teamIds = selectedMatch.map(match => match.teamId).join(',');
    const result = await this.outrightService.uncalculate(matchIds, teamIds);
    if (result.isSuccessful) {
      this.dialogRef.close();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }
}
