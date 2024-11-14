import {Component, inject, OnInit, ViewChild} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { LeagueAutoSettings } from '../../../shared/models/league-auto-settings.model';
import * as _ from 'lodash';
import { LeagueSettingsStore } from '../../services/league-settings.store.native';
import { ZeroFallbackDirective } from '../../../shared/directives/zero-fall-back.directive.native';
import { OnlyIntegerDirective } from '../../../shared/directives';

@Component({
  selector: 'league-auto-settings',
  templateUrl: './league-auto-settings.component.html',
  imports: [AutoTypeComponent,
    CommonModule, TimeSettingComponent, FormsModule,
    AutoPayoutSettingComponent, ToastContainerModule,
    ZeroFallbackDirective, OnlyIntegerDirective],
  providers: [RequestService, ToastrService],
  standalone: true
})
export class LeagueAutoSettingsComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  private  readonly store = inject(LeagueSettingsStore);
  private readonly requestService = inject(RequestService);
  private readonly messageBoxService = inject(MessageBoxService);
  private readonly toastrService = inject(ToastrService);

  private leagueId: string;
  private sportType: string;
  public autoSetting: number;
  public mainResultSettings: ResultSettings;
  public earlyResultSettings: ResultSettings;
  public leagueName: string;

  async ngOnInit(): Promise<void> {
    this.toastrService.overlayContainer = this.toastContainer;

    this.leagueId = UrlHelper.getUrlParameter('leagueId');
    this.sportType = UrlHelper.getUrlParameter('sportType');
    this.autoSetting = Number(UrlHelper.getUrlParameter('autoSetting'));

    this.store.actionAfterUpdate = () => { this.toastrService.clear() };

    const leagueSettings = await this.requestService.getLeagueSetting(Number(this.leagueId), Number(this.sportType));

    this.leagueName = leagueSettings.leagueName;
    this.mainResultSettings = leagueSettings.mainResultSettings;
    this.earlyResultSettings = leagueSettings.earlyResultSettings;

    this.store.setState({...leagueSettings });

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
      const response = {
        isApplyAll: isApplyAll
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

  changeSettingTrader(isMain: boolean) {
    if(isMain) {
      this.mainResultSettings.hasTrader = !this.mainResultSettings.hasTrader;
     
    } else {
      this.earlyResultSettings.hasTrader = !this.earlyResultSettings.hasTrader;
    }
  }

  changeSettingAuto(isMain: boolean) {
    if(isMain) {
      this.mainResultSettings.hasTrader = !this.mainResultSettings.hasTrader;
     
    } else {
      this.earlyResultSettings.hasTrader = !this.earlyResultSettings.hasTrader;
    }
  }
}
