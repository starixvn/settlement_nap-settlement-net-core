import { Component, OnInit } from '@angular/core';
import { UrlHelper } from '../../helper';
import * as _ from 'lodash';
import { MessageBoxService, ClosePopupService } from '../../shared/services';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, ModalDialogMessage, Result } from '../../shared/models';
import { Language } from '../../shared/language';
import { RequestService } from '../services/request.service';
import { Template } from "../models/template.model";

@Component({
  selector: 'auto-setting',
  templateUrl: './auto-setting.component.html',
  providers: [RequestService],
})
export class AutoSettingComponent implements Template, OnInit {
  public currentState: number;
  private readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public pageType: string;
  public errorMessage: string;
  public matchId: number;
  public leagueId: number;

  constructor(
    private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    private readonly closePopupService: ClosePopupService) {
  }

  getNewApi(apiUrl: string) {
    this.requestService.apiUrl = apiUrl;
  }

  ngOnInit(): void {
    this.pageType = UrlHelper.getUrlParameter('pageType');
    this.currentState = Number(UrlHelper.getUrlParameter('currentState'));
    this.getId();
  }

  public getId() {
    if (_.isEqual(this.pageType, "AutoSettingLeague")) {
      this.leagueId = Number(UrlHelper.getUrlParameter('leagueId'));
    } else {
      this.matchId = Number(UrlHelper.getUrlParameter('matchId'));
    }
  }

  public submit() {
    if (_.isEqual(this.pageType, "AutoSettingLeague")) {
      this.comfirmLeagueSettingSubmition();
    } else {
      this.comfirmMatchSettingSubmition();
    }
  }

  public comfirmLeagueSettingSubmition() {
    this.confirmationDialogMessage.title = Language.AutoPayoutSetting.PopupTitle;
    this.confirmationDialogMessage.message = this.getConfirmMessage(this.currentState);
    this.confirmationDialogMessage.hasActionOnNoBtn = true;
    this.messageBoxService.confirm(
        this.confirmationDialogMessage,
        () => this.updateSetting(true),
        () => this.updateSetting(false),
    );
  }

  public comfirmMatchSettingSubmition() {
    this.confirmationDialogMessage.title = Language.AutoPayoutSetting.PopupTitle;
    this.confirmationDialogMessage.message = Language.AutoPayoutSetting.ConfirmMessageForMatch;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      const params = new AutoSettingMatchQuery(
        this.matchId,
        this.getAutoType(),
        this.currentState !== 0,
      );
      this.requestService.updateSettingMatch(params).subscribe((result: Result) => {
          if (result.isSuccessful) {
              this.closePopupService.closePopupPayoutSettingMatch(this.matchId, this.currentState);
          } else {
              this.errorMessage = result.errMsg;
          }
      });
    });
  }

  private getAutoType(){
    const oldState = Number(UrlHelper.getUrlParameter('currentState'));
    return this.currentState === 0 && oldState === 0 ? 1 : this.currentState === 0 ? oldState : this.currentState;
  }

  public getConfirmMessage(newState: number) {
    const newStateName = this.getStateName(newState);
    return Language.AutoPayoutSetting.ConfirmMessageForLeague
            .replace(/EXPECTED_STATE/g, newStateName);
  }

  public getStateName(state: number) {
      switch (state) {
          case 5:
              return 'DIRECT';
          case 1:
              return 'AUTO';
          default:
              return 'OFF';
      }
  }

  private updateSetting(isApplyAll: boolean) {
      const query = new AutoSettingLeagueQuery (
          this.leagueId,
          this.getAutoType(),
          this.currentState !== 0,
          isApplyAll,
      );
      this.requestService.updateSettingLeague(query).subscribe((result: Result) => {
          if (result.isSuccessful) {
              this.closePopupService.closePopupPayoutSettingLeague(this.leagueId, this.currentState, isApplyAll);
          } else {
              this.errorMessage = result.errMsg;
          }
      });
  }
}