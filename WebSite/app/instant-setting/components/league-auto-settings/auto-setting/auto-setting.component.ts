import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeagueSettingsStore } from '../../../services/league-settings.store';
import { distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'auto-setting',
  template: `<div class="title">
	<div>
		<div class="square-icon"></div>
		Turn On/Off Auto Settle for League
	</div>
	<div class="content">
		<div class="auto-settings">
			<span>
				<input type="radio" [ngModel]="autoSetting()" (ngModelChange)="changeAutoSetting($event)" [value]="1" id="auto-payout" name="auto-setting" />
				<label for="auto-payout">Auto Payout</label>
			</span>
			<span>
				<input type="radio" [ngModel]="autoSetting()" (ngModelChange)="changeAutoSetting($event)" [value]="5" id="direct-payout" name="auto-setting" />
				<label for="direct-payout">Direct Payout</label>
			</span>
			<span>
				<input type="radio" [ngModel]="autoSetting()" (ngModelChange)="changeAutoSetting($event)" [value]="0" id="off" name="auto-setting" />
				<label for="off">OFF</label>
			</span>
		</div>
	</div>
</div>`,
  standalone: true,
  imports: [FormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutoTypeComponent {
  autoSetting = input(0);
	private readonly store = inject(LeagueSettingsStore);

  changeAutoSetting(value: number): void { 
    this.store.setState({ ...this.store.state, autoSetting: value});
  }
}
