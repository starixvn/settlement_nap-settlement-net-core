import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeagueSettingsStore } from '../../../services/league-settings.store';
import { CommonModule } from '@angular/common';
import { distinctUntilChanged, map } from 'rxjs';
import { ZeroFallbackDirective } from '../../../../shared/directives/zero-fall-back.directive.native';
import { OnlyIntegerDirective } from '../../../../shared/directives';

@Component({
  selector: 'direct-setting',
  template: `
  <div class="title">
	<div class="line"></div>
	<div>
		<div class="square-icon"></div>
		Direct Payout Setting
	</div>
	<ul>
		<li>
			<label>Waiting-time:&nbsp;</label>
			<input style="width: 40px;" type="text" ZeroFallback myOnlyInteger maxLength="4" (ngModelChange)="changeWaiting($event)" [ngModel]="waitingTime" />
			<label>&nbsp;seconds. </label>
		</li>
	</ul>
</div>`,
  standalone: true,
  imports: [FormsModule, CommonModule, ZeroFallbackDirective , OnlyIntegerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectSettingComponent implements OnInit {
  waitingTime: number = 1;
  constructor(public store: LeagueSettingsStore) {
  }

  ngOnInit(): void{
    this.store.state$
      .pipe(
        map(state => state.waitingTime),
        distinctUntilChanged((prev, curr) => prev == curr))
      .subscribe(data => this.waitingTime = data);
  }

  changeWaiting(seconds: string ) {
    this.store.setState( {... this.store.state, waitingTime: Number(seconds)})
  }
}
