
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingContainerComponent } from './setting-container/setting-container.component';
import { LeagueSettingsStore } from '../../../services/league-settings.store';
import { distinctUntilChanged, map } from 'rxjs';
import * as _ from 'lodash';
import { ZeroFallbackDirective } from '../../../../shared/directives/zero-fall-back.directive.native';
import { OnlyIntegerDirective } from '../../../../shared/directives';

@Component({
  selector: 'auto-payout-setting',
  template: `
  <div class="title">
	<div class="line"></div>
	<div>
		<div class="square-icon"></div>
		Auto Payout Setting
	</div>
	<ul>
		<li>
			<label>Retry-time: </label>
			<input style="width: 40px;" type="text" ZeroFallback myOnlyInteger maxLength="4" [ngModel]="retryTime"  (ngModelChange)="changeRetryTime($event)" />
			<label>&nbsp;seconds. </label>
		</li>
		<li>
			<setting-container  /> 
		</li>
    <li>
      <setting-container [isEarly] = "true"/>
    </li>
	</ul>
</div>
`,
  standalone: true,
  imports: [FormsModule, CommonModule, SettingContainerComponent, ZeroFallbackDirective, OnlyIntegerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class AutoPayoutSettingComponent implements OnInit {
  public retryTime: number;
  constructor(private readonly store: LeagueSettingsStore, private readonly cd: ChangeDetectorRef) {

  }
  ngOnInit(): void {
    this.store.state$.pipe(
      map(state =>  state.retryTime),
      distinctUntilChanged((prev, curr) => _.isEqual(prev, curr)))
      .subscribe(data => {
        this.retryTime = data;
        this.cd.detectChanges();
      });
  }

  changeRetryTime(retryTime: string): void {
    this.store.setState({ ... this.store.state, retryTime: Number(retryTime)});
  }
}
