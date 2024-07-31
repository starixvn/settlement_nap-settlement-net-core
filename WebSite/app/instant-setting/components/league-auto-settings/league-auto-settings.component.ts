import { Component, OnInit, ViewChild } from '@angular/core';
import { ResultSettings } from '../../../shared/models/league-settings.model';
import { UrlHelper } from '../../../helper';
import { AutoTypeComponent } from './auto-setting/auto-setting.component';
import { CommonModule } from '@angular/common';
import { TimeSettingComponent } from './time-setting/time-setting.component';
import { AutoPayoutSettingComponent } from './auto-payout-setting/auto-payout-setting.component';
import { RequestService } from '../../services/request.service';
import { MessageBoxService } from '../../../shared/services';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { Language } from '../../../shared/language.native';
import { ModalDialogMessage } from '../../../shared/models';
import { LeagueAutoSettings } from '../../../shared/models/leagus-auto-settings.model';
import * as _ from 'lodash';
import { LeagueSettingsStore } from '../../services/league-settings.store.native';

@Component({
  selector: 'league-auto-settings',
  templateUrl: './league-auto-settings.component.html',
  imports: [AutoTypeComponent, CommonModule, TimeSettingComponent,
    AutoPayoutSettingComponent, ToastContainerModule],
  providers: [RequestService, ToastrService],
  standalone: true
})
export class LeagueAutoSettingsComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  private leagueId: string;
  private sportType: string;
  waitingTime: number;
  refundWaitingTime: number;
  autoSetting: number;
  leagueName: string;
  retryTime: number;

  constructor(
    private readonly store: LeagueSettingsStore,
    private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    private readonly toastrService: ToastrService) {
  }
  async ngOnInit(): Promise<void> {
    this.toastrService.overlayContainer = this.toastContainer;
    this.leagueId = UrlHelper.getUrlParameter('leagueId');
    this.sportType = UrlHelper.getUrlParameter('sportType');
    this.waitingTime = Number(UrlHelper.getUrlParameter('waitingTime'));
    this.refundWaitingTime = Number(UrlHelper.getUrlParameter('refundWaitingTime'));
    this.autoSetting = Number(UrlHelper.getUrlParameter('autoSetting'));
    this.store.actionAfterUpdate = () => { this.toastrService.clear() };
    const leagueSettings = await this.requestService.getLeagueSetting(Number(this.leagueId), Number(this.sportType));
    this.leagueName = leagueSettings.leagueName;
    this.retryTime = leagueSettings.retryTime;
    this.store.setState({
      ...leagueSettings,
      waitingTime: this.waitingTime,
      refundWaitingTime: this.refundWaitingTime,
      autoSetting: this.autoSetting
    });
    this.store.originalState = _.cloneDeep(this.store.state);
  }

  cancel() {
    this.messageBoxService.closePopup();
  }

  submit() {
    if (this.verifyQuantityProvider(this.store.state.mainResultSettings) || this.verifyQuantityProvider(this.store.state.earlyResultSettings)) {
      this.toastrService.error(Language.AutoPayoutSetting.MinimumSource);
      return;
    }

    const confirmBox = new ModalDialogMessage(Language.confirmationBox);
    confirmBox.message = Language.AutoPayoutSetting.ConfirmMessageForAutoSetting;
    confirmBox.hasActionOnNoBtn = true;
    this.messageBoxService.confirm(confirmBox, () => {
      this.updateSetting(true);
    }, () => {
      this.updateSetting(false);
    });
  }

  private async updateSetting(isApplyAll = false) {
    const result = await this.requestService.updateLeagueSetting(this.store.originalState, this.store.state, isApplyAll);
    if (result.isSuccessful) {
      const response: LeagueAutoSettings = {
        isApplyAll: isApplyAll,
        autoSetting: this.store.state.autoSetting,
        waitingTime: this.store.state.waitingTime,
        retryTime: this.store.state.retryTime,
        refundWaitingTime: this.store.state.refundWaitingTime
      }
      parent.document.getElementById('dialog-response').setAttribute('value', JSON.stringify(response));
      this.messageBoxService.closePopup();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private verifyQuantityProvider(resultSettings: ResultSettings) {
    return !resultSettings.hasTrader && resultSettings.minimumProvider === 1;
  }
}
