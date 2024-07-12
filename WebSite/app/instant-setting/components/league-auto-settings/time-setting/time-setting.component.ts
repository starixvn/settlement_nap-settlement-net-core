import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeagueSettingsStore } from '../../../services/league-settings.store';
import { CommonModule } from '@angular/common';
import { distinctUntilChanged, map } from 'rxjs';
import { ZeroFallbackDirective } from '../../../../shared/directives/zero-fall-back.directive.native';
import { OnlyIntegerDirective } from '../../../../shared/directives';

@Component({
  selector: 'time-setting',
  template: `
  <div class="title">
	<div class="line"></div>
	<div>
		<div class="square-icon"></div>
		    {{ directSetting() ? "Direct Payout Setting" : "Auto Refund Setting"}}
	</div>
	<ul>
		<li>
			<label>Waiting-time:&nbsp;</label>
			<input style="width: 40px;" type="text" ZeroFallback myOnlyInteger maxLength="4" (ngModelChange)="changeWaiting($event)" [ngModel]="waitingTime()" />
			<label>&nbsp;seconds. </label>
		</li>
	</ul>
</div>`,
  standalone: true,
  imports: [FormsModule, CommonModule, ZeroFallbackDirective, OnlyIntegerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeSettingComponent {
  directSetting = input(false);
  waitingTime = input.required<number>();
  private readonly store = inject(LeagueSettingsStore);

  changeWaiting(seconds: string) {
    if (this.directSetting()) {
      this.store.setState({ ... this.store.state, waitingTime: Number(seconds) })
      return;
    }
    this.store.setState({ ... this.store.state, refundWaitingTime: Number(seconds) })
  }
}
