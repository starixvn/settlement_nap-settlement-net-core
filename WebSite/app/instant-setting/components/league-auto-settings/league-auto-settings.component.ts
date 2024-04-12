import { LeagueSettingsStore } from '../../services/league-settings.store';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LeagueSettings, ResultSettings } from '../../../shared/models/league-settings.model';
import { UrlHelper } from '../../../helper';
import { AutoTypeComponent } from './auto-setting/auto-setting.component';
import { CommonModule } from '@angular/common';
import { DirectSettingComponent } from './direct-setting/direct-setting.component';
import { AutoPayoutSettingComponent } from './auto-payout-setting/auto-payout-setting.component';
import { Subject, distinctUntilChanged, map, takeUntil } from 'rxjs';
import { RequestService } from '../../services/request.service';
import { MessageBoxService } from '../../../shared/services';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { Language } from '../../../shared/language.native';
import { ModalDialogMessage } from '../../../shared/models';
import { LeagueAutoSettings } from '../../../shared/models/leagus-auto-settings.model';
import * as _ from 'lodash';

@Component({
  selector: 'league-auto-settings',
  templateUrl: './league-auto-settings.component.html',
  imports: [AutoTypeComponent, CommonModule, DirectSettingComponent,
    AutoPayoutSettingComponent, ToastContainerModule],
  providers: [RequestService, ToastrService],
  standalone: true
})
export class LeagueAutoSettingsComponent implements OnInit, OnDestroy {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  private leagueId: string;
  private sportType: string;
  private waitingTime: number;
  private autoSetting: number;
  public leagueName: string;
  ngUnsubscribe = new Subject();

  constructor(
    private readonly store: LeagueSettingsStore,
    private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    private readonly toastrService: ToastrService) {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(1);
    this.ngUnsubscribe.complete();
  }

  async ngOnInit(): Promise<void> {
    this.toastrService.overlayContainer = this.toastContainer;
    this.leagueId = UrlHelper.getUrlParameter('leagueId');
    this.sportType = UrlHelper.getUrlParameter('sportType');
    this.waitingTime = Number(UrlHelper.getUrlParameter('waitingTime'));
    this.autoSetting = Number(UrlHelper.getUrlParameter('autoSetting'));
    this.store.actionAfterUpdate = () => { this.toastrService.clear() };
    this.store.state$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map(state => state.leagueName),
        distinctUntilChanged((prev, curr) => prev == curr))
      .subscribe(data => this.leagueName = data);

    const leagueSettings = await this.requestService.getLeagueSetting(Number(this.leagueId), Number(this.sportType));

    this.store.setState({ ...leagueSettings, waitingTime: this.waitingTime, autoSetting: this.autoSetting });
    this.store.originalState = _.cloneDeep(this.store.state);
  }

  cancel() {
    this.messageBoxService.closePopup();
  }

  submit() {
    if (this.verifyQuantityProvider(this.store.state.mainResultSettings) || this.verifyQuantityProvider(this.store.state.earlyResultSettings) ) {
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

  private async updateSetting(isApplyAll: boolean = false) {
    const result = await this.requestService.updateLeagueSetting(this.store.originalState, this.store.state, isApplyAll);
    if (result.isSuccessful) {
      const response: LeagueAutoSettings = {
        isApplyAll: isApplyAll,
        autoSetting: this.store.state.autoSetting,
        waitingTime: this.store.state.waitingTime,
        retryTime: this.store.state.retryTime
      }
      parent.document.getElementById('dialog-response').setAttribute('value', JSON.stringify(response));
      this.messageBoxService.closePopup();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private verifyQuantityProvider(resultSettings: ResultSettings) {
    return !resultSettings.hasTrader && resultSettings.minimumProvider == 1;
  }
}
