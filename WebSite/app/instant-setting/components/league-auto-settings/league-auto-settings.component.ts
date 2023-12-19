import { LeagueSettingsService } from './../../services/league-settings.service';
import { Component, OnInit } from '@angular/core';
import { LeagueSettings } from '../../models/league-settings.model';
import { UrlHelper } from '../../../helper';
import {AutoTypeComponent} from './auto-type/auto-type.component';
import { CommonModule } from '@angular/common';
import { DirectSettingComponent } from './direct-setting/direct-setting.component';
import { AutoPayoutSettingComponent } from './auto-payout-setting/auto-payout-setting.component';

@Component({
  selector: 'league-auto-settings',
  templateUrl: './league-auto-settings.component.html',
  imports: [AutoTypeComponent, CommonModule, DirectSettingComponent, AutoPayoutSettingComponent],
  providers: [LeagueSettingsService],
  standalone: true
})
export class LeagueAutoSettingsComponent  implements OnInit{
  private leagueId: string;
  public leagueSettings: LeagueSettings ={
    LeagueName: 'league-auto-setting',
    AutoSetting: 0,
    WaitingTime: 0,
    RetryTime: 0,
    MainResultSetting: {
      NeedTrader: false,
      MinimumTrader: 1,
      PrimaryTrader: [],
      SecondaryTrader: []
    },
    EarlyResultSetting: {
      NeedTrader: false,
      MinimumTrader: 1,
      PrimaryTrader: [],
      SecondaryTrader: []
    },
  };

  ngOnInit(): void{
    this.leagueId = UrlHelper.getUrlParameter('leagueId');
  }
}
