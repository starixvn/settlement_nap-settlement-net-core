import { Component, OnInit } from '@angular/core';
import { UrlHelper } from '../../../helper';
import * as _ from 'lodash';
import { MessageBoxService } from '../../../shared/services';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, ModalDialogMessage } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { RequestService } from '../../services/request.service';
import { SettingQuery } from '../../models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'auto-setting',
  templateUrl: './auto-setting.component.html',
  imports: [FormsModule, CommonModule],
  providers: [RequestService],
  standalone: true
})
export class AutoSettingComponent implements OnInit {
  public currentState: number;
  private readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public pageType: string;
  public errorMessage: string;
  public matchId: number;
  public leagueId: number;
  public isMultiSelect: boolean;
  public listSetting: Array<SettingQuery> = [
    { type: 1, isEnable: false, text: "Auto Payout", sortText: "AUTO" },
    { type: 5, isEnable: false, text: "Direct Payout", sortText: "DIRECT" },
  ];

  public originalListSetting: Array<SettingQuery>;
  private readonly dialogResponseElement = 'dialog-response';


  constructor(
    private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService) {
    this.confirmationDialogMessage.title = Language.AutoPayoutSetting.PopupTitle;
  }

  ngOnInit(): void {
    this.pageType = UrlHelper.getUrlParameter('pageType');
    this.isMultiSelect = UrlHelper.getUrlParameter('multiSelect') === 'true';
    this.currentState = Number(UrlHelper.getUrlParameter('currentState'));
    this.parseValue();
    this.getId();
  }


  private parseValue() {
    if (this.isMultiSelect) {
      const settings = UrlHelper.getUrlParameter('currentState').split('');
      this.listSetting.forEach(item => item.isEnable = _.isEqual(settings[item.type - 1], "1"));
      this.originalListSetting = _.cloneDeep(this.listSetting);
    }
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
      this.confirmLeagueSettingSubmission();
    } else {
      this.confirmMatchSettingSubmission();
    }
  }

  private confirmLeagueSettingSubmission() {
    this.confirmationDialogMessage.message = this.getConfirmMessage(this.currentState);
    this.confirmationDialogMessage.hasActionOnNoBtn = true;
    this.messageBoxService.confirm(
      this.confirmationDialogMessage,
      async () => {
        if (this.isMultiSelect) {
           await this.updateMultiSetting(true);
        } else {
          await this.updateSetting(true);
        } 
      },
      async () => {
        if (this.isMultiSelect) {
          await this.updateMultiSetting(false);
        } else {
          await this.updateSetting(false);
        }
      }
    );
  }
  

  private confirmMatchSettingSubmission() {
    this.confirmationDialogMessage.message = Language.AutoPayoutSetting.ConfirmMessageForMatch;
    this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
      if (this.isMultiSelect) {
        await this.changeMultiSettingMatch();
      } else {
        await this.changeSingleSetting();
      }
    });
  }

  private async changeSingleSetting() {
    const params = new AutoSettingMatchQuery(
      this.matchId,
      this.getAutoType(),
      this.currentState !== 0,
    );

    const result = await this.requestService.updateSettingMatch(params);
    if (result.isSuccessful) {
      parent.document.getElementById(this.dialogResponseElement).setAttribute('value', this.currentState.toString());
      this.messageBoxService.closePopup();
    } else {
      this.errorMessage = result.errMsg;
    }
  }

  private async changeMultiSettingMatch() {
    const listItem = this.getValueChanged();

    for (const { item: currentItem, i } of listItem.map((item, i) => ({ item, i }))) {
      const params = new AutoSettingMatchQuery(
        this.matchId,
        currentItem.type,
        currentItem.isEnable,
      );

      const result = await this.requestService.updateSettingMatch(params);
      if (result.errCode > 0) {
        this.errorMessage = result.errMsg;
        return;
      }
      if (_.isEqual(Number(i), listItem.length - 1)) {
        parent.document.getElementById(this.dialogResponseElement).setAttribute('value', this.parseValueToResponse());
      }
    }

    this.messageBoxService.closePopup();
  }

  private getAutoType() {
    const oldState = Number(UrlHelper.getUrlParameter('currentState'));
    return this.currentState === 0 && oldState === 0 ? 1 : this.currentState === 0 ? oldState : this.currentState;
  }

  public getConfirmMessage(newState: number) {
    const newStateName = this.isMultiSelect ? this.getMultiStateName() : this.getStateName(newState);
    return Language.AutoPayoutSetting.ConfirmMessageForLeague
      .replace(/EXPECTED_STATE/g, newStateName);
  }

  private getMultiStateName() {
    if (this.listSetting.every(item => item.isEnable)) {
      return "BOTH";
    }

    if (this.listSetting.every(item => !item.isEnable)) {
      return "OFF";
    }

    return this.listSetting.filter(item => item.isEnable)[0].sortText;
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

  private async updateSetting(isApplyAll: boolean) {
    const query = new AutoSettingLeagueQuery(
      this.leagueId,
      this.getAutoType(),
      this.currentState !== 0,
      isApplyAll,
    );

    const result = await this.requestService.updateSettingLeague(query);
    if (result.isSuccessful) {
      parent.document.getElementById(this.dialogResponseElement)?.setAttribute('value', `${this.currentState},${isApplyAll}`);
      this.messageBoxService.closePopup();
    } else {
      this.errorMessage = result.errMsg;
    }
  }


  private async updateMultiSetting(isApplyAll: boolean) {
    const listItem = this.getValueChanged();
    for (const { item: currentItem, i } of listItem.map((item, i) => ({ item, i }))) {
      const query = new AutoSettingLeagueQuery(
        this.leagueId,
        currentItem.type,
        currentItem.isEnable,
        isApplyAll,
      );
      const result = await this.requestService.updateSettingLeague(query);
      if (result.errCode > 0) {
        this.errorMessage = result.errMsg;
        return;
      }
      if (_.isEqual(Number(i), listItem.length - 1)) {
        parent.document.getElementById(this.dialogResponseElement).setAttribute('value', `${this.parseValueToResponse()},${isApplyAll}`);
      }
    }
    this.messageBoxService.closePopup();
  }

  private parseValueToResponse() {
    const listValue = this.listSetting.filter(item => item.isEnable);
    if (_.isEmpty(listValue)) {
      return '0';
    }
    const typeValue = this.listSetting.filter(item => item.isEnable).map(item => Math.pow(2, item.type - 1)).reduce((a, b) => a + b, 0);
    return typeValue.toString(2).split("").reverse().join("");
  }

  private getValueChanged() {
    return this.listSetting.filter(item => {
      return this.originalListSetting.find(s => s.type === item.type && s.isEnable !== item.isEnable);
    });
  }
}