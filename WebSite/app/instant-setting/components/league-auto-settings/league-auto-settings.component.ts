import { LeagueSettingsStore } from '../../services/league-settings.store';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LeagueSettings } from '../../models/league-settings.model';
import { UrlHelper } from '../../../helper';
import {AutoTypeComponent} from './auto-type/auto-type.component';
import { CommonModule } from '@angular/common';
import { DirectSettingComponent } from './direct-setting/direct-setting.component';
import { AutoPayoutSettingComponent } from './auto-payout-setting/auto-payout-setting.component';
import { Subject, distinctUntilChanged, map, takeUntil } from 'rxjs';
import { RequestService } from '../../services/request.service';
import * as _ from 'lodash';

@Component({
  selector: 'league-auto-settings',
  templateUrl: './league-auto-settings.component.html',
  imports: [AutoTypeComponent, CommonModule, DirectSettingComponent, AutoPayoutSettingComponent],
  providers: [RequestService],
  standalone: true
})
export class LeagueAutoSettingsComponent  implements OnInit, OnDestroy{
  private leagueId: string;
  private sportType: string;
  private waitingTime: number;
  private autoSetting : number;
  public leagueSettings: LeagueSettings ;
  public leagueName: string;
  ngUnsubscribe = new Subject();

  constructor(public store: LeagueSettingsStore, private readonly requestService: RequestService) {
  }
  ngOnDestroy() {
    this.ngUnsubscribe.complete();
  }

  async ngOnInit(): Promise<void>{
    this.leagueId = UrlHelper.getUrlParameter('leagueId');
    this.sportType = UrlHelper.getUrlParameter('sportType');
    this.waitingTime = Number(UrlHelper.getUrlParameter('waitingTime'));
    this.autoSetting = Number(UrlHelper.getUrlParameter('autoSetting'));
    this.store.state$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map(state => state.leagueName),
        distinctUntilChanged((prev, curr) => prev == curr))
      .subscribe(data => {
        this.leagueName = data;
      });

      const leagueSettings = await  this.requestService.getLeagueSetting(Number(this.leagueId), Number(this.sportType));

      this.store.setState({...leagueSettings, waitingTime: this.waitingTime, autoSetting: this.autoSetting});
  }
}
