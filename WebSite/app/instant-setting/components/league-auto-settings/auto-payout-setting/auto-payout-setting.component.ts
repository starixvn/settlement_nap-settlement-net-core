
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingContainerComponent } from './setting-container/setting-container.component';
import { LeagueSettingsStore } from '../../../services/league-settings.store.native';
import { distinctUntilChanged, map } from 'rxjs';
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
  </div>
	<ul>
		<li>
			<label>Retry-time: </label>
			<input style="width: 40px;" type="text" ZeroFallback myOnlyInteger maxLength="4" [ngModel]="retryTime()"  (ngModelChange)="changeRetryTime($event)" />
			<label>&nbsp;seconds. </label>
		</li>
		<li>
			<setting-container  /> 
		</li>
    <li>
      <setting-container [isEarly] = "true"/>
    </li>
	</ul>
`,
  standalone: true,
  imports: [FormsModule, CommonModule, SettingContainerComponent, ZeroFallbackDirective, OnlyIntegerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class AutoPayoutSettingComponent {
  retryTime = input(0);
  private readonly store = inject(LeagueSettingsStore);

  changeRetryTime(retryTime: string): void {
    this.store.setState({ ... this.store.state, retryTime: Number(retryTime)});
  }
}
