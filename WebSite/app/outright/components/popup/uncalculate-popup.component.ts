import { LeagueSettle, Team } from '../../models';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { UrlHelper } from '../../../helper';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { OutrightService } from '../../services/outright.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { FormsModule } from '@angular/forms';

import * as _ from 'lodash';
import { StatusId } from '../../constants/status-id.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'uncalculate-popup',
  templateUrl: './uncalculate-popup.component.html',
  standalone: true,
  providers:[OutrightService, HttpRequestService, BlockUIService , MessageBoxService  ],
  imports: [CommonModule, ToastContainerModule, HttpClientModule, FormsModule],
})
export class UncalculatePopupComponent implements OnInit{
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public teams: Team[];
  public leagueSettle: LeagueSettle;
  public blockUI = true;

 constructor(private readonly toastrService: ToastrService,
  private readonly outrightService: OutrightService,
  private readonly blockUIService: BlockUIService,
  private readonly messageBoxService: MessageBoxService){}
  ngOnInit(): void {
    this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastrService.overlayContainer = this.toastContainer;
    this.getMatches();
  }

  async getMatches(){
    const leagueId = Number(UrlHelper.getUrlParameter('leagueId'));
    const sportType = Number(UrlHelper.getUrlParameter('sportType'));
    this.leagueSettle = await this.outrightService.getMatches(leagueId, sportType, StatusId.Completed);
    this.teams = this.leagueSettle.teams;
  }

  public clearError(){
    this.toastrService.clear();
  };

  public disableUncalculate(){
    return _.isEmpty(_.filter(this.teams, team => team.selected)) || !this.leagueSettle.permission.canUncalculateOutright;
  }

  public async uncalculate() {
    this.clearError();
    const selectedMatch = _.filter(this.teams, team => team.selected);
    const matchIds = selectedMatch.map(match => match.orId).join(',');
    const teamIds = selectedMatch.map(match => match.teamId).join(',');
    const result = await this.outrightService.uncalculate(matchIds, teamIds);
    if(result.isSuccessful){
      this.messageBoxService.closePopup();
    }else {
      this.toastrService.error(result.errMsg);
    }
  }
}
